# ADR 0004: Monorepo com pnpm e Vitest

- Status: Aceito
- Data: 2026-11-25

## Contexto

Núcleo, CLI e servidor MCP são pacotes separados que evoluem juntos e compartilham tipos.

## Decisão

Usar um monorepo com workspaces do pnpm (`packages/*`), TypeScript em modo estrito com módulos ESM (`NodeNext`) e Vitest para testes. Node.js 22 ou mais novo.

## Consequências

- Uma mudança no núcleo e no consumidor dela entra no mesmo PR.
- pnpm é rápido e evita dependências fantasmas entre pacotes.
- Contribuidores precisam ter o pnpm instalado (`corepack enable` resolve).
