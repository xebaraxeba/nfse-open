# nfse-open

Emita NFS-e pelo padrão nacional com poucos comandos, ou direto no chat do Claude com `/emitir-nota`.

[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

> Projeto open source para MEIs, prestadores de serviço e devs que querem emitir nota fiscal sem dor de cabeça.

> **Status:** em desenvolvimento. O núcleo já valida e organiza a nota; a conexão com a API nacional, a CLI e o plugin do Claude vêm a seguir. Ainda não use em produção.

## Por que existe

Emitir nota fiscal de serviço ainda é burocrático. O nfse-open simplifica isso com uma biblioteca, uma CLI e um plugin do Claude, todos abertos.

## O que ele faz

- Emite, consulta e cancela NFS-e no padrão nacional
- Assina com o seu certificado digital A1
- Gera o DANFSe em PDF
- Funciona em homologação (testes) e em produção
- Pede confirmação antes de emitir uma nota real

## Começo rápido

### Biblioteca

```ts
import { EmitirNota, RepositorioEmMemoria, TransmissorSimulado } from "@nfse-open/core";

const emitir = new EmitirNota({
  transmissor: new TransmissorSimulado(), // troque pelo adaptador da API nacional
  repositorio: new RepositorioEmMemoria(),
});

const resultado = await emitir.executar({
  ambiente: "homologacao",
  serie: "1",
  competencia: "2026-11-25",
  prestador: { documento: "11.222.333/0001-81", municipio: "3550308", regime: "mei" },
  tomador: { documento: "529.982.247-25", nome: "João da Silva" },
  servico: {
    codigoTributacaoNacional: "010101",
    descricao: "Consultoria em sistemas",
    municipioPrestacao: "3550308",
  },
  valorCentavos: 150000,
});

if (resultado.tipo === "emitida") console.log(resultado.nota.chaveAcesso);
```

### CLI (em breve)

```sh
npm install -g nfse-open
nfse config --certificado ./meu-certificado.pfx
nfse emitir --tomador 12345678000199 --servico "Consultoria" --valor 1500
```

### No Claude (em breve)

1. Instale o plugin (veja `docs/plugin-claude.md`)
2. Digite `/emitir-nota`
3. Responda tomador, serviço e valor, confira e confirme

## Como é por dentro

Arquitetura hexagonal: o núcleo guarda as regras da nota, e adaptadores conectam a API do governo, o certificado, a CLI e o Claude. Detalhes em [docs/arquitetura.md](docs/arquitetura.md).

```
packages/core   regras da NFS-e, portas e casos de uso
packages/cli    linha de comando (em breve)
packages/mcp    servidor MCP e plugin do Claude (em breve)
docs/           guias, arquitetura e ADRs
specs/          especificações (Spec Driven Development)
```

## Desenvolvimento

```sh
pnpm install
pnpm test
pnpm typecheck
```

Requer Node.js 22 ou mais novo e pnpm 10.

## Segurança

Seu certificado e sua senha ficam só na sua máquina e nunca vão para o repositório. Veja [SECURITY.md](SECURITY.md).

## Roadmap

- [x] Especificação do núcleo
- [x] Núcleo: validação, numeração e casos de uso
- [ ] Emissão em homologação na API nacional
- [ ] CLI
- [ ] Plugin do Claude (MCP)
- [ ] NF-e de produtos

## Contribua

Toda ajuda é bem-vinda. Leia [CONTRIBUTING.md](CONTRIBUTING.md) e procure issues com o rótulo `good first issue`.

## Licença

[MIT](LICENSE)
