import type { DadosDps } from "../src/index.js";

export const CNPJ_PRESTADOR = "11.222.333/0001-81";
export const CPF_TOMADOR = "529.982.247-25";
export const SAO_PAULO = "3550308";

export function dadosValidos(alteracoes: Partial<DadosDps> = {}): DadosDps {
  return {
    ambiente: "homologacao",
    serie: "1",
    numero: 1,
    competencia: "2026-11-25",
    emitidaEm: new Date("2026-11-25T12:00:00Z"),
    prestador: {
      documento: CNPJ_PRESTADOR,
      municipio: SAO_PAULO,
      regime: "mei",
      nome: "Maria Consultoria",
    },
    tomador: { documento: CPF_TOMADOR, nome: "João da Silva", email: "joao@example.com" },
    servico: {
      codigoTributacaoNacional: "010101",
      descricao: "Consultoria em sistemas",
      municipioPrestacao: SAO_PAULO,
    },
    valorCentavos: 150000,
    ...alteracoes,
  };
}
