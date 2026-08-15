# Sofia — Mapa Único de Evolução

> A Sofia já existe e continua a operar. O objetivo é evoluir a implementação atual por etapas pequenas, versionadas e verificáveis.

## Regra de trabalho

Não iniciar uma nova frente enquanto a etapa atual não tiver resultado validado, documentação atualizada e checkpoint/commit registado. Não criar infraestrutura nova, não migrar para Supabase e não ativar workflows permanentemente nesta fase.

## Estado atual

A Sofia existente é a baseline funcional. O Kernel, n8n, tools, WhatsApp, Calendar, PostgreSQL na Hetzner e integrações existentes continuam a ser a base. As tabelas `sofia.work_items` e `sofia.work_item_events` já foram criadas na produção através de uma migration aditiva e validadas por leitura. O workflow inicial de confirmação/verificação existe, mas está inativo.

## Concluído

| Área | Resultado | Referência |
|---|---|---|
| Produto | Sofia existente preservada como baseline | Decisão de evolução incremental |
| Infraestrutura | PostgreSQL existente na Hetzner mantido | Changelog de infraestrutura |
| Dados | `sofia.work_items` e `sofia.work_item_events` criadas | Migration 001, execução 44277 |
| n8n | Workflow inicial de confirmação/verificação criado e inativo | `g7IHbjD26KiscNVx3` |
| Git | Branch de segurança criada | `feature/sofia-upgrade-core` |
| Notion | Decisões e commits registados | Changelog Sofia |

## Pendente

Ainda não foi validado o ciclo completo com uma marcação real: criar Work Item, criar evento no Calendar, verificar o evento, persistir `verified`, registar eventos append-only, repetir o mesmo pedido sem duplicar o evento e confirmar isolamento entre tenants.

## Plano em duas etapas

### Etapa 1 — Provar criação e verificação de uma marcação

**Objetivo:** demonstrar que a Sofia consegue criar uma marcação real, confirmar que o evento existe no Google Calendar e registar o resultado no Work Item Engine.

**Ações:**

1. Adicionar o gate de idempotência que impede nova criação no Calendar quando já existe Work Item `verified` com `google_event_id`.
2. Escolher uma marcação futura real e autorizada.
3. Ativar temporariamente o workflow de teste.
4. Executar uma única marcação.
5. Confirmar manualmente o evento no Calendar.
6. Consultar `sofia.work_items` e `sofia.work_item_events`.
7. Desativar o workflow.
8. Registar resultado, evidências e commit.

**Critério de conclusão:** uma marcação criada e verificada, um Work Item `verified`, eventos de criação/verificação registados e nenhum evento duplicado.

### Etapa 2 — Provar resiliência e isolamento

**Objetivo:** demonstrar que retries não duplicam ações externas e que um tenant não consegue aceder ao trabalho de outro.

**Ações:** repetir o mesmo pedido com a mesma `idempotency_key`; simular uma verificação inválida; testar dois contextos de tenant; confirmar isolamento de queries, memória, credenciais, Calendar e Work Items.

**Critério de conclusão:** retry idempotente, falha corretamente registada, isolamento validado e nenhum vazamento entre tenants.

## Responsabilidades

| Componente | Responsabilidade |
|---|---|
| Kernel Sofia | Única autoridade para decidir e alterar estados de Work Item |
| n8n | Coordenação de workflows e chamadas a tools |
| `05 - Tool Agenda` | Criação do evento no Calendar |
| Módulo de verificação | Leitura e comparação do evento real |
| PostgreSQL | Estado transacional e histórico de eventos |
| Humano | Autorizar teste, avaliar resultado e aprovar avanço |
| Claude Code | Apoiar inspeção, implementação e testes conforme instruções documentadas |

## Não fazer agora

Não criar staging, não migrar para Supabase, não criar serviço separado, não ativar o workflow permanentemente, não testar vários módulos ao mesmo tempo e não alterar produção fora do fluxo definido nesta página.

## Próxima ação única

A única ação autorizada após a validação deste mapa é: **implementar e versionar o gate de idempotência antes do primeiro teste real de marcação**.

## Formato de cada avanço

Cada avanço deve registar: objetivo, alteração feita, evidência, resultado e próxima ação única. O commit, workflow n8n, execução e rollback devem ser sempre indicados.

## Estado de aprovação

- Estado: mapa consolidado; aguarda validação humana.
- Produção: sem novas alterações autorizadas até validação do mapa.
- Próxima ação: gate de idempotência.
