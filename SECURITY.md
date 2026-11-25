# Segurança

## Reportando uma falha

Não abra issue pública para falhas de segurança. Use o recurso **Report a vulnerability** na aba Security do repositório (GitHub Private Vulnerability Reporting). Respondemos assim que possível e combinamos a divulgação depois da correção.

## Cuidados com o certificado A1

O certificado digital A1 (`.pfx`) dá poder de emitir notas em seu nome. Trate como uma senha bancária.

- O nfse-open lê o certificado **só na sua máquina**. O núcleo nunca recebe o arquivo nem a senha; apenas o adaptador de assinatura usa os dois.
- Nunca coloque o certificado ou a senha no repositório. O `.gitignore` bloqueia `*.pfx`, `*.p12`, `*.pem`, `*.key` e `.env`.
- Prefira passar a senha por variável de ambiente ou pelo cofre do sistema, nunca por argumento de linha de comando (fica no histórico do terminal).
- Use o ambiente de **homologação** para testar. Notas de homologação não têm valor fiscal.
- Se o certificado vazar, revogue com a sua autoridade certificadora e emita outro.

## Notas em produção

Emitir ou cancelar em produção sempre exige confirmação explícita, na biblioteca, na CLI e no plugin do Claude.
