# ADR 0005: Resultados em vez de exceções e valores em centavos

- Status: Aceito
- Data: 2026-11-25

## Contexto

Quem usa a CLI ou o chat precisa ver todos os erros dos dados de uma vez, em português, para corrigir numa rodada só. E valores monetários com ponto flutuante perdem precisão (`0.1 + 0.2`).

## Decisão

- Validações e casos de uso devolvem objetos com `tipo` ou `ok`, listando todos os problemas, em vez de lançar exceção na primeira falha. Exceções ficam para falhas inesperadas (rede, disco).
- Valores são guardados como centavos inteiros (`Dinheiro.centavos`) e só viram decimal na hora de montar o XML.

## Consequências

- A CLI e o servidor MCP traduzem o `tipo` direto em mensagem ou pergunta ao usuário.
- Quem chama precisa tratar cada `tipo`; o TypeScript ajuda a não esquecer nenhum.
