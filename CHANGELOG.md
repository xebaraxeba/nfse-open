# Changelog

Todas as mudanças relevantes deste projeto ficam aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue o [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado

- Monorepo com pnpm, TypeScript e Vitest.
- `@nfse-open/core`: validação de CPF e CNPJ (inclusive alfanumérico), valores em centavos, DPS com validação completa e identificador no leiaute nacional.
- Casos de uso `EmitirNota`, `ConsultarNota` e `CancelarNota`, com confirmação obrigatória em produção.
- Portas `TransmissorFiscal`, `AssinadorDigital` e `RepositorioDeNotas`, e adaptadores em memória para testes.
- Documentação inicial, ADRs e spec do núcleo.
