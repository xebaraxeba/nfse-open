# Como contribuir

Obrigado pelo interesse no nfse-open! Toda ajuda é bem-vinda: código, documentação, testes ou validação das regras fiscais.

## Por onde começar

- Procure issues com o rótulo `good first issue` ou `help wanted`.
- Tem uma ideia ou dúvida? Abra uma issue ou uma discussão antes de começar algo grande.
- Contadores: revisar regras fiscais e campos da nota ajuda muito.

## Como o projeto é desenvolvido

O projeto segue Spec Driven Development com o [Spec Kit](https://github.com/github/spec-kit): a especificação vem antes do código. Mudanças de comportamento começam pela spec, depois viram testes e só então código.

Decisões importantes são registradas como ADRs em [docs/adr/](docs/adr/).

## Rodando local

> O código ainda está sendo estruturado. Esta seção será atualizada quando o monorepo estiver pronto.

Requisitos previstos: Node.js LTS e um certificado A1 de testes para o ambiente de homologação.

**Nunca** use um certificado de produção para desenvolver e **nunca** faça commit de certificados (`.pfx`, `.p12`), senhas ou arquivos `.env`.

## Padrão de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

```
feat(core): emitir nota em homologação
fix(cli): validar CNPJ do tomador
docs: explicar configuração do certificado
```

Tipos mais comuns: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Pull requests

1. Faça um fork e crie um branch a partir do `main`.
2. Mantenha o PR pequeno e focado em um assunto.
3. Inclua testes para regras novas ou corrigidas.
4. Atualize a documentação e o [CHANGELOG.md](CHANGELOG.md) quando fizer sentido.
5. Descreva o que mudou e por quê.

## Código de conduta

Ao participar, você concorda com o nosso [Código de Conduta](CODE_OF_CONDUCT.md).
