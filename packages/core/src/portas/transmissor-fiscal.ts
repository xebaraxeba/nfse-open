import type { Ambiente, Dps } from "../dominio/dps.js";
import type { MotivoCancelamento, Nota } from "../dominio/nota.js";

/** Erro devolvido pela administração tributária, com o código oficial quando houver. */
export interface ErroFiscal {
  readonly codigo: string;
  readonly mensagem: string;
}

export type RespostaTransmissao =
  | {
      readonly tipo: "autorizada";
      readonly chaveAcesso: string;
      readonly numero: string;
      readonly autorizadaEm: Date;
      readonly xml?: string;
    }
  | { readonly tipo: "rejeitada"; readonly erros: readonly ErroFiscal[] };

export interface PedidoCancelamento {
  readonly chaveAcesso: string;
  readonly ambiente: Ambiente;
  readonly motivo: MotivoCancelamento;
  readonly justificativa: string;
}

export type RespostaCancelamento =
  | { readonly tipo: "cancelada"; readonly canceladaEm: Date }
  | { readonly tipo: "rejeitada"; readonly erros: readonly ErroFiscal[] };

/**
 * Porta de saída para o órgão que autoriza a nota. O adaptador da NFS-e
 * nacional monta o XML, assina com o {@link AssinadorDigital} e conversa com a API.
 * Uma NF-e futura seria só outro adaptador desta mesma porta.
 */
export interface TransmissorFiscal {
  transmitir(dps: Dps): Promise<RespostaTransmissao>;
  consultar(chaveAcesso: string, ambiente: Ambiente): Promise<Omit<Nota, "dps"> | undefined>;
  cancelar(pedido: PedidoCancelamento): Promise<RespostaCancelamento>;
}
