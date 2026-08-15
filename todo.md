# Estado consolidado — Evolução da Sofia

## Regra temporária

Não executar novos comandos, migrations, ativações n8n, alterações de produção ou mudanças de arquitetura até o mapa único da evolução estar documentado no Notion e aprovado pela equipa.

## Concluído

- [x] Sofia existente preservada como baseline.
- [x] Página técnica e página comercial do site versionadas.
- [x] Repositório privado GitHub sincronizado.
- [x] Branch `feature/sofia-upgrade-core` criada.
- [x] SQL versionado para `sofia.work_items` e `sofia.work_item_events`.
- [x] Tabelas criadas na produção Hetzner através de workflow n8n dedicado.
- [x] Estrutura validada por leitura.
- [x] Workflow inicial de confirmação/verificação criado e mantido inativo.
- [x] Decisões de multi-tenant, PostgreSQL na Hetzner e Work Item Engine documentadas no Notion.

## Pendente, sem execução ainda

- [ ] Fechar o mapa único de evolução.
- [ ] Definir o primeiro teste controlado de marcação.
- [ ] Corrigir o gate de idempotência antes de repetir ações externas.
- [ ] Definir consulta por `tenant_id` + `idempotency_key`.
- [ ] Desviar Work Item `verified` com `google_event_id` para resposta existente.
- [ ] Permitir criação no Calendar apenas para Work Item novo ou incompleto.
- [ ] Testar primeira execução e repetição do mesmo pedido.
- [ ] Confirmar que a repetição não cria segundo evento.
- [ ] Documentar o gate no mapa único e no changelog.
- [ ] Versionar o workflow e o contrato na branch de segurança.
- [ ] Testar uma marcação real futura.
- [ ] Confirmar evento no Calendar.
- [ ] Confirmar Work Item e eventos append-only.
- [ ] Testar falha de verificação.
- [ ] Testar retry sem duplicação.
- [ ] Testar isolamento entre dois tenants.
- [ ] Integrar o padrão no Kernel somente após aprovação dos testes.

## Bloqueado até aprovação

- [ ] Ativar workflow de produção de forma permanente.
- [ ] Migrar para Supabase.
- [ ] Criar staging ou nova infraestrutura.
- [ ] Criar novos serviços.
- [ ] Adicionar novos módulos antes de validar marcação.

## Documentação obrigatória

- [ ] Criar mapa único no Notion.
- [ ] Registar estado atual, etapas, ações, responsável e critério de avanço.
- [ ] Referenciar cada commit, workflow e decisão no mesmo documento.
- [ ] Definir uma única próxima ação por fase.
