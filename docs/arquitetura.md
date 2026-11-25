# Arquitetura

O nfse-open usa **arquitetura hexagonal** (portas e adaptadores).

## Em uma frase

O núcleo sabe as regras da nota e mais nada. Ele não sabe quem o chama (CLI, chat ou API) nem para onde a nota vai (governo, banco de dados). Essas pontas se encaixam por fora, como tomadas.

## Para quem não é dev

Pense numa máquina de café com encaixe padrão. A máquina (o núcleo) sabe fazer café. A água pode vir de um galão ou da torneira, e o café pode sair num copo ou numa garrafa. Trocar o galão não muda a receita. Aqui, trocar a API do governo ou adicionar a NF-e não muda as regras da nota.

## Camadas

```
         entrada                    núcleo (packages/core)                 saída
  ┌──────────────────┐   ┌──────────────────────────────────────┐   ┌─────────────────────┐
  │ CLI              │   │ Casos de uso                         │   │ API NFS-e nacional  │
  │ API HTTP         │──▶│   EmitirNota, ConsultarNota,         │──▶│ Assinatura A1       │
  │ Servidor MCP     │   │   CancelarNota                       │   │ SQLite              │
  │ (Claude)         │   │ Domínio                              │   │                     │
  └──────────────────┘   │   Dps, Prestador, Tomador, Serviço,  │   └─────────────────────┘
                         │   Documento, Dinheiro, Nota          │             ▲
                         │ Portas (interfaces)                  │─────────────┘
                         │   TransmissorFiscal, AssinadorDigital│  implementam
                         │   RepositorioDeNotas                 │
                         └──────────────────────────────────────┘
```

### Domínio (`src/dominio`)

Tipos e validações puras, sem I/O.

- `Documento`: CPF ou CNPJ validado, incluindo o CNPJ alfanumérico.
- `Dinheiro`: valores em centavos inteiros, para não perder precisão.
- `Dps`: a Declaração de Prestação de Serviço. `criarDps` valida tudo e devolve a lista completa de problemas.
- `Nota`: a NFS-e já autorizada, com chave de acesso de 50 dígitos.

As validações devolvem um `Resultado` (`{ ok: true, valor }` ou `{ ok: false, problemas }`) em vez de lançar exceção. Assim a CLI e o chat mostram todos os erros de uma vez, em português.

### Casos de uso (`src/casos-de-uso`)

- `EmitirNota`: valida, pede confirmação em produção, reserva o número da DPS, transmite e guarda.
- `ConsultarNota`: consulta a situação no governo e atualiza a cópia local.
- `CancelarNota`: valida motivo e justificativa, pede confirmação em produção e cancela.

Cada caso de uso devolve um resultado com `tipo` (`emitida`, `invalida`, `confirmacao-necessaria`, `rejeitada`...). É esse `tipo` que a CLI e o plugin do Claude usam para decidir o que mostrar.

### Portas (`src/portas`)

- `TransmissorFiscal`: transmitir, consultar e cancelar no órgão autorizador.
- `AssinadorDigital`: assinar XML com o certificado A1.
- `RepositorioDeNotas`: numerar DPS e guardar notas.

O adaptador da NFS-e nacional implementa `TransmissorFiscal`. Ele monta o XML da DPS, pede a assinatura ao `AssinadorDigital` e conversa com a API. O formato XML fica no adaptador, não no núcleo, porque é detalhe da NFS-e nacional: a NF-e teria outro formato e outro adaptador.

### Adaptadores

| Adaptador | Porta | Onde | Situação |
| --- | --- | --- | --- |
| `TransmissorSimulado` | TransmissorFiscal | core (testes) | pronto |
| `RepositorioEmMemoria` | RepositorioDeNotas | core (testes) | pronto |
| API NFS-e nacional | TransmissorFiscal | a definir | próximo passo |
| Assinatura A1 (.pfx) | AssinadorDigital | a definir | próximo passo |
| SQLite | RepositorioDeNotas | a definir | planejado |
| CLI | entrada | `packages/cli` | planejado |
| Servidor MCP | entrada | `packages/mcp` | planejado |

## Confirmação antes de emitir

Em produção, `EmitirNota` e `CancelarNota` não fazem nada sem `confirmado: true`. Sem isso, devolvem `confirmacao-necessaria` com um resumo legível. A regra mora no núcleo de propósito: nenhum adaptador de entrada consegue esquecer dela.
