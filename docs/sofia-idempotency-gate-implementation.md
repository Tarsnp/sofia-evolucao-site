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

## Fluxo antes do gate

```text
Validar contexto
  → Criar/recuperar Work Item
  → Registar work_item.created
  → Criar evento no Calendar
  → Verificar evento
```

## Fluxo depois do gate

```text
Validar contexto
  → Criar/recuperar Work Item
  → Registar work_item.created
  → Consultar Work Item por tenant_id + idempotency_key
  → Classificar Idempotência
  → Já está verified com google_event_id?
       ├─ Sim → reutilizar resultado → registar work_item.idempotency_reused
       └─ Não → criar evento → verificar → persistir verified/failed
```

## Nós adicionados

| Nó | Função |
|---|---|
| `Consultar Work Item Idempotencia` | Consulta o Work Item dentro do tenant através de `tenant_id` e `idempotency_key`. |
| `Classificar Idempotencia` | Calcula `idempotency_reuse` verificando `status` e `google_event_id`. |
| `Reutilizar Resultado Verificado?` | Desvia o caminho já concluído antes de chamar o Calendar. |
| `Preparar Resultado Reutilizado` | Devolve o resultado existente com `reused: true`. |
| `Registar Reutilizacao Idempotente` | Cria evento auditável `work_item.idempotency_reused`. |

## Implementação SQL do gate

```sql
SELECT work_item_id, tenant_id, status, result
FROM sofia.work_items
WHERE tenant_id = $1
  AND idempotency_key = $2
LIMIT 1;
```

A consulta é sempre filtrada por `tenant_id`. Nunca se deve procurar a chave de idempotência globalmente.

## Teste local realizado

O teste `tests/idempotency-gate.test.mjs` cobre os dois caminhos:

| Cenário | Resultado esperado | Resultado |
|---|---|---|
| Work Item novo ou incompleto | `create_and_verify_calendar_event` | Passou |
| Work Item `verified` com `google_event_id` | `reuse_verified_result` | Passou |

O teste é puramente local e não cria dados, não chama o n8n e não chama o Google Calendar.

## Estado n8n

Workflow: `SOFIA - Upgrade 01 - Marcacao Confirmacao Verificacao`  
ID: `g7IHbjYDyZgwYjLl`  
Estado: inativo  
Nós após a alteração: 18

O workflow foi atualizado, mas não foi ativado e nenhum teste real de marcação foi executado.

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
