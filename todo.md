# Auditoria de marca LABORYA

## Nova decisão de identidade

## Regra de execução

Toda alteração no site deve ser feita sobre uma versão guardada, com checkpoint antes da edição, verificação visual depois da edição e novo checkpoint somente após validação. Não usar alterações destrutivas nem substituir a versão estável sem possibilidade de rollback.


O ícone/logo atual da Sofia permanece como referência oficial e não será substituído nesta fase. Qualquer proposta futura deve demonstrar ligação visual e estratégica com o universo LABORYA, preservar reconhecimento, funcionar em aplicações reais e ser avaliada por critérios de posicionamento, diferenciação, memorabilidade, escalabilidade e coerência com o site público.


- [ ] Verificar se o conector Dropbox está disponível nesta sessão.
- [ ] Localizar a pasta ou área Marketing no Dropbox.
- [ ] Rever logos, paleta, fontes, guidelines e exemplos de comunicação.
- [ ] Abrir e analisar visualmente o site público https://www.uselaborya.com/.
- [ ] Comparar o sistema de marca encontrado com o site Sofia atual.
- [ ] Documentar divergências de cores, tipografia, logo, tom e componentes.
- [ ] Propor sistema de marca alinhado para a Sofia sem substituir o logo atual.
- [ ] Se solicitado, criar uma alternativa profissional usando o ícone atual como referência, não como substituição automática.
- [ ] Apresentar comparação e recomendação antes de implementar alterações.
- [ ] Guardar checkpoint de segurança antes da revisão visual.
- [ ] Implementar revisão LABORYA em alteração isolada.
- [ ] Verificar desktop e mobile.
- [ ] Guardar novo checkpoint apenas após validação.

## Futura página comercial Sofia para negócios

## Execução aprovada

A página comercial será criada como rota separada, sem substituir a página oficial “Sofia — Evolução Incremental”. Toda alteração será validada nas duas rotas e guardada num checkpoint reversível.


- [ ] Definir ICP inicial entre negócios locais de serviços.
- [ ] Estruturar narrativa comercial separada da página técnica oficial.
- [ ] Definir casos de uso concretos sem inventar resultados ou testemunhos.
- [ ] Criar CTA de piloto e formulário de qualificação.
- [ ] Definir prova operacional, segurança e supervisão humana.
- [ ] Preservar a página atual como referência oficial da equipa.
- [ ] Criar wireframe e rota `/sofia-para-negocios`.
- [ ] Implementar hero comercial e proposta de valor.
- [ ] Adicionar casos de uso SMB e demonstração operacional.
- [ ] Adicionar secção de confiança, piloto e CTA de qualificação.
- [ ] Validar rota técnica e rota comercial em desktop e mobile.
- [ ] Guardar checkpoint da nova versão.

## Upgrade Sofia — duas etapas

- [ ] Documentar no Notion em LABORYA · Sofia — Changelog de Versões.
- [ ] Definir baseline e objetivos do upgrade.
- [ ] Definir arquitetura do fluxo de marcação com confirmação e verificação.
- [ ] Definir contratos de Work Item, estados, permissões e idempotência.
- [ ] Definir responsabilidades para execução colaborativa com Claude.
- [ ] Criar checkpoint WebDev antes das alterações.
- [ ] Criar branch Git de segurança para o upgrade.
- [ ] Confirmar critérios de aceitação e plano de rollback.
- [ ] Adicionar requisito multi-tenant/SaaS ao changelog.
- [ ] Tornar `tenant_id` obrigatório no Work Item e nas tools do piloto.
- [ ] Definir isolamento de memória, credenciais, canais, políticas, logs e retries.
- [ ] Separar tenant, unidade, conta de canal, utilizador final e instância da Sofia.
- [ ] Adicionar testes de não-vazamento entre tenants aos critérios de aceitação.
- [ ] Confirmar branch `feature/sofia-upgrade-core` como base de trabalho.
- [ ] Localizar no n8n o workflow operacional de marcação.
- [ ] Mapear pontos de confirmação, criação de evento e resposta final.
- [ ] Preparar módulo de verificação sem alterar produção.
- [ ] Documentar no Notion cada alteração do fluxo.

## GitHub

- [ ] Criar repositório privado `Tarsnp/sofia-evolucao-site`.
- [ ] Adicionar o remoto GitHub sem remover o remoto WebDev.
- [ ] Enviar o branch `main` e confirmar o commit publicado.
- [ ] Verificar URL, visibilidade e estado limpo do repositório.
