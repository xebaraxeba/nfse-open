# Política de segurança

O nfse-open lida com certificados digitais e dados fiscais. Levamos segurança a sério.

## Como reportar uma falha

**Não abra uma issue pública** para falhas de segurança.

Use o recurso de relato privado do GitHub: aba **Security** do repositório, botão **Report a vulnerability**. Inclua:

- Descrição da falha e do impacto
- Passos para reproduzir
- Versão afetada, se souber

Responderemos o mais rápido possível e combinaremos a divulgação depois da correção.

## Cuidados com o certificado A1

- O certificado (`.pfx` ou `.p12`) e a senha ficam só na sua máquina. O nfse-open não envia esses dados a nenhum servidor além da API oficial da NFS-e nacional.
- Nunca faça commit do certificado, da senha ou de arquivos `.env`. O `.gitignore` do projeto já bloqueia esses arquivos.
- Guarde a senha em variável de ambiente ou no cofre de senhas do sistema, nunca no código.
- Use o ambiente de homologação para testes.
- Se o certificado vazar, revogue-o junto à autoridade certificadora e emita um novo.

## Versões com suporte

O projeto ainda não tem versão publicada. Quando houver, esta seção indicará quais versões recebem correções de segurança.
