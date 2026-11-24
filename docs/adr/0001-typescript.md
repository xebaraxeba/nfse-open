# ADR 0001: Usar TypeScript

- Status: Aceito
- Data: 2026-11-24

## Contexto

O projeto precisa de um núcleo, uma CLI e um servidor MCP para o plugin do Claude. Queremos uma linguagem popular para atrair contribuidores.

## Decisão

Usar TypeScript com Node.js em todo o monorepo.

## Consequências

- O SDK oficial de MCP em TypeScript é maduro, o que facilita o plugin.
- Tipagem forte ajuda a modelar os campos da nota e evitar erros.
- Assinatura de XML exige bibliotecas específicas, que precisam ser avaliadas.
