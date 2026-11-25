# ADR 0003: Arquitetura hexagonal

- Status: Aceito
- Data: 2026-11-24

## Contexto

O mesmo núcleo será usado pela CLI, por uma API HTTP e pelo Claude, e a API do governo pode mudar.

## Decisão

Adotar portas e adaptadores: o núcleo define interfaces (TransmissorFiscal, AssinadorDigital, RepositorioDeNotas) e cada integração é um adaptador.

## Consequências

- Trocar a API do governo ou adicionar a NF-e não mexe nas regras da nota.
- O núcleo fica fácil de testar com adaptadores falsos.
- Há um pouco mais de estrutura no início.
