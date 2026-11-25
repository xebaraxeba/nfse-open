/**
 * Porta para assinar documentos XML com o certificado digital do prestador
 * (A1, arquivo .pfx). O certificado e a senha ficam só no adaptador, na máquina
 * do usuário; o núcleo nunca os vê.
 */
export interface AssinadorDigital {
  /**
   * Assina o elemento do XML cujo atributo `Id` é `idReferencia`
   * (XMLDSig envelopado) e devolve o XML assinado.
   */
  assinarXml(xml: string, idReferencia: string): Promise<string>;
}
