# Como contribuir

Obrigado pelo interesse! Toda ajuda conta: código, documentação, testes em homologação e revisão das regras fiscais.

## Rodando localmente

```sh
git clone https://github.com/xebaraxeba/nfse-open.git
cd nfse-open
pnpm install
pnpm test
```

Requer Node.js 22+ e pnpm 10.

## Como trabalhamos

- **Spec antes do código.** Toda funcionalidade nova começa por uma spec em `specs/`. Cada regra da spec vira um teste antes da implementação.
- **Fatias finas.** Prefira PRs pequenos que entregam um caminho completo a PRs grandes.
- **Núcleo sem dependências de fora.** `packages/core` não conhece HTTP, arquivos nem certificado. Integrações entram como adaptadores (veja `docs/arquitetura.md`).
- **Decisões importantes viram ADR** em `docs/adr/`, com contexto, decisão e consequências.

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português:

```
feat(core): valida CNPJ alfanumérico
fix(cli): corrige leitura do valor com vírgula
docs: explica configuração do certificado
```

## Pull requests

1. Crie um branch a partir de `main`.
2. Garanta que `pnpm test` e `pnpm typecheck` passam.
3. Descreva o que muda e por quê, e aponte a spec ou issue relacionada.
4. Atualize o `CHANGELOG.md` na seção "Não lançado".

## Nunca envie

Certificados (`.pfx`, `.p12`), senhas, `.env` ou dados fiscais reais de clientes. O `.gitignore` já bloqueia os casos comuns, mas confira antes do commit.
