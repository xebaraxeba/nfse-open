import type { Ambiente, Dps } from "./dps.js";

/** Chave de acesso da NFS-e nacional: 50 dígitos. */
export const FORMATO_CHAVE_ACESSO = /^\d{50}$/;

export function chaveAcessoValida(chave: string): boolean {
  return FORMATO_CHAVE_ACESSO.test(chave ?? "");
}

export type SituacaoNota = "autorizada" | "cancelada";

/** NFS-e autorizada pela administração tributária. */
export interface Nota {
  readonly chaveAcesso: string;
  readonly numero: string;
  readonly ambiente: Ambiente;
  readonly autorizadaEm: Date;
  readonly situacao: SituacaoNota;
  readonly dps: Dps;
  /** XML da NFS-e devolvido pelo governo, quando disponível. */
  readonly xml?: string;
}

/** Motivos de cancelamento aceitos pelo evento de cancelamento da NFS-e nacional. */
export type MotivoCancelamento = "erro-na-emissao" | "servico-nao-prestado" | "outros";

export const JUSTIFICATIVA_MINIMA = 15;
export const JUSTIFICATIVA_MAXIMA = 255;
