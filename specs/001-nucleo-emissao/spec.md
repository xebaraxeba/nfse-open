# Spec 001: Núcleo de emissão de NFS-e

- Branch: `001-nucleo-emissao`
- Status: Em implementação
- Criada em: 2026-11-25

## Contexto

Prestadores de serviço, principalmente MEIs, precisam emitir NFS-e no padrão nacional sem depender de sistemas caros. Esta spec cobre o núcleo: as regras que valem para qualquer forma de uso (CLI, chat, API), sem falar de tecnologia.

## Histórias de usuário

### H1: Emitir uma nota de teste (prioridade P1)
Como prestador, quero emitir uma nota em homologação informando tomador, serviço e valor, para testar sem risco fiscal.

**Critérios de aceite**
1. Dados completos e válidos em homologação → a nota é emitida sem pedir confirmação, recebe chave de acesso e fica guardada.
2. Cada nova DPS recebe o próximo número da série do prestador, sem repetir.

### H2: Ver todos os erros de uma vez (P1)
Como prestador, quero saber tudo o que está errado nos dados antes de enviar, para corrigir numa rodada só.

**Critérios de aceite**
1. Dados com vários erros → recebo a lista completa, cada item com o campo e uma mensagem em português.
2. Dados inválidos → nada é enviado ao governo e nenhum número de DPS é gasto.

### H3: Confirmar antes de uma nota real (P1)
Como prestador, quero ver um resumo e confirmar antes de emitir em produção, para não emitir nota errada com valor fiscal.

**Critérios de aceite**
1. Pedido em produção sem confirmação → recebo um resumo (ambiente, prestador, tomador, serviço, valor, competência) e nada é enviado.
2. Mesmo pedido com confirmação → a nota é emitida.

### H4: Entender uma rejeição (P2)
Como prestador, quero ver o código e a mensagem quando o governo rejeita a nota.

**Critérios de aceite**
1. Rejeição → recebo os erros do governo e a nota não é guardada como emitida.

### H5: Consultar uma nota (P2)
1. Chave fora do formato (50 dígitos) → aviso de chave inválida, sem consulta.
2. Nota existente → recebo a situação atual, completada com os dados locais.
3. Situação mudou no governo → a cópia local é atualizada.

### H6: Cancelar uma nota (P2)
1. Motivo deve ser erro na emissão, serviço não prestado ou outros.
2. Justificativa entre 15 e 255 caracteres.
3. Em produção, cancelamento também exige confirmação.
4. Cancelada com sucesso → a cópia local passa para "cancelada".

## Regras de validação

| Campo | Regra |
| --- | --- |
| Documento (prestador, tomador) | CPF com 11 dígitos ou CNPJ com 14 caracteres (12 alfanuméricos + 2 dígitos), com dígitos verificadores válidos; aceita pontuação e minúsculas |
| Tomador | Opcional; se informado, exige documento válido e nome, e não pode ser o próprio prestador |
| E-mail | Formato válido, quando informado |
| Município (prestador, prestação) | Código IBGE de 7 dígitos |
| Regime do prestador | Não optante, MEI ou ME/EPP do Simples Nacional |
| Série | 1 a 5 dígitos |
| Número da DPS | Inteiro de 1 a 15 dígitos, atribuído automaticamente |
| Competência | Data real no formato AAAA-MM-DD |
| Código de tributação nacional | 6 dígitos (item, subitem e desdobro da LC 116/2003) |
| Descrição do serviço | Obrigatória, até 2000 caracteres |
| Valor | Maior que zero, em centavos, até 13 dígitos inteiros |

## Identificador da DPS

45 caracteres: `DPS` + município emissor (7) + tipo de inscrição (1 = CPF, 2 = CNPJ) + inscrição federal (14, CPF com zeros à esquerda) + série (5) + número (15).

## Fora do escopo desta spec

- Montagem do XML, assinatura e chamada à API nacional (spec 002).
- Tributação detalhada (retenções, alíquotas, deduções) e DANFSe em PDF.
- CLI (spec 003) e servidor MCP com `/emitir-nota` (spec 004).

## Dúvidas em aberto

- Quais campos tributários são obrigatórios para MEI na DPS nacional, e quais o governo preenche sozinho?
- Validar o código IBGE contra a lista oficial de municípios aderentes, ou só o formato?
- Como evitar número de DPS duplicado se a transmissão falhar no meio (rede caiu depois do envio)?
