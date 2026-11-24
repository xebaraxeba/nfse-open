# nfse-open

Emita NFS-e pelo padrão nacional com poucos comandos, ou direto no chat do Claude com `/emitir-nota`.

[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

> Projeto open source para MEIs, prestadores de serviço e devs que querem emitir nota fiscal sem dor de cabeça.

## Por que existe

Emitir nota fiscal de serviço ainda é burocrático. O nfse-open simplifica isso com uma biblioteca, uma CLI e um plugin do Claude, todos abertos.

## O que ele faz

- Emite, consulta e cancela NFS-e no padrão nacional
- Assina com o seu certificado digital A1
- Gera o DANFSe em PDF
- Funciona em homologação (testes) e em produção

## Começo rápido

> Em desenvolvimento: os comandos abaixo mostram como o projeto vai funcionar.

### CLI

```bash
npm install -g nfse-open
nfse config --certificado ./meu-certificado.pfx
nfse emitir --tomador 12345678000199 --servico "Consultoria" --valor 1500
```

### No Claude

1. Instale o plugin (veja `docs/plugin-claude.md`)
2. Digite `/emitir-nota`
3. Responda tomador, serviço e valor, confira e confirme

## Como é por dentro

Arquitetura hexagonal: o núcleo guarda as regras da nota, e adaptadores conectam a API do governo, o certificado, a CLI e o Claude. As decisões estão em [docs/adr/](docs/adr/).

## Segurança

Seu certificado e sua senha ficam só na sua máquina e nunca vão para o repositório. Veja [SECURITY.md](SECURITY.md).

## Roadmap

- [ ] Especificação com Spec Kit
- [ ] Emissão em homologação
- [ ] CLI
- [ ] Plugin do Claude (MCP)
- [ ] NF-e de produtos

Mais detalhes em [docs/iniciativa.md](docs/iniciativa.md).

## Contribua

Toda ajuda é bem-vinda. Leia o [CONTRIBUTING.md](CONTRIBUTING.md) e procure issues com o rótulo `good first issue`.

## Licença

[MIT](LICENSE)
