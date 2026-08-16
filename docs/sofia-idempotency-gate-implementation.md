# Gate de Idempotência — Sofia

## Objetivo

Impedir que uma repetição do mesmo pedido crie um segundo evento no Google Calendar quando o Work Item já foi concluído e possui `google_event_id`.

## Regra

A identidade do pedido é composta por:

```text
tenant_id + idempotency_key
```

A reutilização só é permitida quando as duas condições forem verdadeiras:

```text
status = verified
AND result.google_event_id existe
```

Se a condição for verdadeira, o workflow devolve o resultado existente e não chama o Calendar. Caso contrário, continua para criação e verificação.

## Bug real corrigido (16/08/2026): race condition na primeira versão do gate

A primeira versão do gate (consulta simples + decisão) não era atómica. O fluxo era:

```text
Criar/recuperar Work Item (INSERT ... ON CONFLICT DO UPDATE ... RETURNING *)
  → Registar work_item.created
  → Consultar Work Item por tenant_id + idempotency_key   (SELECT simples)
  → Classificar Idempotência
  → Já está verified com google_event_id?
       ├─ Sim → reutilizar
       └─ Não → criar evento no Calendar
```

Duas execuções quase simultâneas para o mesmo `idempotency_key` passavam ambas pelo `INSERT ... ON CONFLICT DO UPDATE` (que já existia antes do gate e sempre devolve uma linha, própria ou alheia), e ao chegar ao `SELECT` viam ambas o mesmo estado `created` — nenhuma tinha ainda escrito `verified`. Ambas classificavam como "não é duplicado" e ambas avançavam para criar um evento no Calendar. Exatamente o bug que o gate deveria evitar.

**Causa raiz:** o `SELECT` lê um estado que pode mudar entre a leitura e a escrita seguinte — não há reserva (claim) atómica antes da decisão.

## Correção: reserva atómica (claim) em cascata, antes de qualquer chamada ao Calendar

```text
Validar contexto
  → Reivindicar Work Item (INSERT ... ON CONFLICT (tenant_id, idempotency_key) DO NOTHING RETURNING *, status='running' já na inserção)
  → Reivindicação criada?
       ├─ Sim (linha devolvida) → esta execução é a criadora
       │      → Registar work_item.created → Preparar Operação Agenda → Criar Calendar → Verificar → persistir verified/failed
       └─ Não (0 linhas — a chave já existe) → Reivindicar Retry (UPDATE ... SET status='running'
              WHERE status IN ('failed','cancelled','expired') RETURNING *)
              → Reivindicação de retry criada?
                   ├─ Sim → esta execução ganhou o retry → Preparar Operação Agenda → Criar Calendar → ... (mesmo work_item_id, sem re-registar work_item.created)
                   └─ Não → Consultar Work Item Idempotencia (SELECT, agora só alcançável quando ninguém tem direito de agir)
                        → Classificar Idempotência
                        → verified + google_event_id?
                             ├─ Sim → reutilizar resultado → registar work_item.idempotency_reused
                             └─ Não (created/queued/running/waiting_customer/waiting_human/verifying) → "em processamento", devolve ao Kernel sem criar segundo evento
```

Cada passo da cascata é uma operação SQL única (`INSERT ... ON CONFLICT DO NOTHING RETURNING *` ou `UPDATE ... WHERE status IN (...) RETURNING *`) — o próprio motor Postgres garante que, entre execuções concorrentes, só uma consegue "ganhar" cada reserva; as restantes recebem zero linhas de volta de forma determinística, sem qualquer janela de leitura-depois-decide. Mesmo padrão já validado no projeto em `09-Tool Logs` → nó `Postgres Verificar Registar` (`INSERT ... ON CONFLICT (message_id) DO NOTHING RETURNING message_id`).

Nenhuma query faz `version = version + 1` manualmente — o trigger `sofia.set_work_item_updated_at` já incrementa a versão em cada `UPDATE`. Todas as queries mantêm o filtro por `tenant_id`, mesmo com a constraint composta (defesa em profundidade).

## Nós do workflow

| Nó | Função |
|---|---|
| `Criar ou Recuperar Work Item` | Reivindicação atómica de um Work Item novo: `INSERT ... ON CONFLICT (tenant_id, idempotency_key) DO NOTHING RETURNING *`, já com `status='running'`. `alwaysOutputData: true` para o IF seguinte conseguir distinguir "0 linhas" de forma explícita. |
| `Reivindicacao Criada?` | IF: linha devolvida → esta execução criou o Work Item. Sem linha → a chave já existe, tenta reivindicação de retry. |
| `Reivindicar Retry Work Item` | Reivindicação atómica de retry: `UPDATE ... SET status='running' WHERE status IN ('failed','cancelled','expired') RETURNING *` (compare-and-swap). `alwaysOutputData: true`. |
| `Reivindicacao Retry Criada?` | IF: linha devolvida → esta execução ganhou o retry. Sem linha → o item existente não está num estado retomável (está ativo ou já concluído) — só agora consulta. |
| `Consultar Work Item Idempotencia` | Consulta o Work Item dentro do tenant através de `tenant_id` e `idempotency_key`. Inalterada, mas agora só alcançável como último recurso. |
| `Classificar Idempotencia` | Calcula `idempotency_reuse` verificando `status` e `google_event_id`. Inalterada. |
| `Reutilizar Resultado Verificado?` | `true` → reutilizar. `false` → "em processamento" (nunca mais cria evento, ao contrário da versão anterior). |
| `Preparar Resultado Reutilizado` | Devolve o resultado existente com `reused: true`. Inalterada. |
| `Registar Reutilizacao Idempotente` | Cria evento auditável `work_item.idempotency_reused`. Inalterada. |
| `Preparar Resultado Em Processamento` | Novo. Devolve `in_progress: true` ao Kernel sem criar segundo evento, para qualquer estado não-terminal que não seja `verified`. |

## Implementação SQL do gate (cascata completa)

```sql
-- Passo 1: reivindicação de Work Item novo
INSERT INTO sofia.work_items (tenant_id, business_id, worker_instance_id, type, status, priority, idempotency_key, correlation_id, payload)
VALUES ($1,$2,$3,$4,'running',$5,$6,$7,$8::jsonb)
ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
RETURNING *;

-- Passo 2 (só se o passo 1 não devolver linha): reivindicação de retry
UPDATE sofia.work_items
SET status = 'running'
WHERE tenant_id = $1 AND idempotency_key = $2
  AND status IN ('failed','cancelled','expired')
RETURNING *;

-- Passo 3 (só se nem o passo 1 nem o 2 devolverem linha): consulta final
SELECT work_item_id, tenant_id, status, result
FROM sofia.work_items
WHERE tenant_id = $1
  AND idempotency_key = $2
LIMIT 1;
```

Todas as três queries são sempre filtradas por `tenant_id`. Nunca se deve procurar a chave de idempotência globalmente.

## Prova de concorrência real (16/08/2026)

Executado diretamente contra produção (workflow temporário isolado, sem tocar no Google Calendar, arquivado depois do teste): duas execuções da query do passo 1 disparadas com ~119ms de diferença para o mesmo `tenant_id`/`idempotency_key`. Resultado: a primeira devolveu a linha (`work_item_id`, `status: running`, `version: 1`); a segunda devolveu zero linhas (`{"success":true}`, sem `work_item_id`). Uma terceira tentativa sequencial confirmou o mesmo resultado. Verificação final: **exatamente 1 linha** existia na tabela para essa chave, apesar de 3 tentativas de reivindicação. Dado de teste removido explicitamente após a verificação (`DELETE ... RETURNING work_item_id`, 1 linha removida).

## Teste local (`tests/idempotency-gate.test.mjs`)

O teste continua puramente local — não cria dados, não chama o n8n e não chama o Google Calendar — mas passou a cobrir também a corrida real, não só os dois caminhos sequenciais isolados:

| Cenário | Resultado esperado | Resultado |
|---|---|---|
| Work Item novo ou incompleto | `create_and_verify_calendar_event` | Passou |
| Work Item `verified` com `google_event_id` | `reuse_verified_result` | Passou |
| 5 tentativas de reivindicação simultâneas para a mesma chave | Exatamente 1 vencedor, 4 rejeitadas, 1 linha persistida | Passou |
| Rajada de retries após o vencedor | Nenhuma nova reivindicação possível | Passou |
| Reivindicação de retry (compare-and-swap) com 4 tentativas simultâneas sobre um item `failed` | Exatamente 1 vencedor | Passou |

A simulação local modela a garantia real do Postgres (`ON CONFLICT ... DO NOTHING` / `UPDATE ... WHERE status IN (...)`) através de um `Map` com chave única — o ponto crítico do teste é nunca deixar as tentativas concorrentes decidirem com base num estado lido antes de qualquer escrita, que era exatamente o bug original.

## Estado n8n

Workflow: `SOFIA - Upgrade 01 - Marcacao Confirmacao Verificacao`
ID: `g7IHbjYDyZgwYjLl`
Estado: inativo
Nós após a correção da race condition: 22

O workflow foi atualizado, mas não foi ativado e nenhum teste real de marcação (com criação de evento real no Google Calendar) foi executado — apenas a lógica de reivindicação foi testada isoladamente contra produção, sem tocar no Calendar.

## Versionamento

A alteração deve ser commitada apenas com o workflow, o teste e este documento:

```bash
git switch feature/sofia-upgrade-core
git add docs/n8n/sofia-upgrade-01-marcacao-confirmacao-verificacao.json \
        docs/sofia-idempotency-gate-implementation.md \
        tests/idempotency-gate.test.mjs
git commit -m "feat: prevent duplicate calendar appointments"
git push github feature/sofia-upgrade-core
```

## Critérios antes da ativação

A ativação só pode ocorrer depois de confirmar que uma primeira execução cria e verifica um evento real, que a repetição da mesma `idempotency_key` não cria um segundo evento e que o Work Item reutilizado fica auditado com `work_item.idempotency_reused`.

A branch `main` não deve ser alterada nesta etapa. A promoção só deve acontecer depois da validação humana e da atualização do changelog no Notion.
