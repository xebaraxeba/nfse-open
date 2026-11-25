# Constituição do nfse-open

## Princípios

### I. Simplicidade primeiro
Emitir uma nota deve levar poucos passos, na CLI ou no chat. Se uma funcionalidade precisa de manual longo, está complicada demais. Preferimos menos opções bem feitas.

### II. Segurança do certificado (inegociável)
O certificado A1 e sua senha ficam só na máquina do usuário e só o adaptador de assinatura os usa. Nunca são registrados em log, enviados a terceiros ou versionados. Emitir ou cancelar em produção exige confirmação explícita.

### III. Testes obrigatórios
Toda regra da spec vira um teste antes do código. O núcleo é testado com adaptadores simulados, sem rede. Nenhum PR entra com testes falhando.

### IV. Núcleo independente
`packages/core` não depende de HTTP, disco, certificado nem framework. Integrações entram como adaptadores das portas do núcleo.

### V. Aberto e em português
Licença MIT. Código de domínio, mensagens ao usuário e documentação em português do Brasil, em Markdown. Decisões importantes registradas em ADR.

## Fluxo de desenvolvimento

Spec (`/speckit.specify`) → dúvidas (`/speckit.clarify`) → plano (`/speckit.plan`) → tarefas (`/speckit.tasks`) → implementação (`/speckit.implement`). Cada camada (core, cli, mcp) tem sua spec, começando pelo core. Entregas em fatias finas.

## Governança

Esta constituição prevalece sobre outras práticas. Mudanças exigem PR com justificativa e atualização da versão abaixo.

**Versão**: 1.0.0 | **Ratificada**: 2026-11-25 | **Última alteração**: 2026-11-25
