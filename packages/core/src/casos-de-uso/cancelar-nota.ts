import type { Ambiente } from "../dominio/dps.js";
import {
  chaveAcessoValida,
  JUSTIFICATIVA_MAXIMA,
  JUSTIFICATIVA_MINIMA,
  type MotivoCancelamento,
} from "../dominio/nota.js";
import type { Problema } from "../dominio/resultado.js";
import type { RepositorioDeNotas } from "../portas/repositorio-de-notas.js";
import type { ErroFiscal, TransmissorFiscal } from "../portas/transmissor-fiscal.js";

export interface PedidoCancelamentoNota {
  chaveAcesso: string;
  ambiente: Ambiente;
  motivo: MotivoCancelamento;
  justificativa: string;
  /** Cancelar em produção também exige confirmação explícita. */
  confirmado?: boolean;
}

export type ResultadoCancelamento =
  | { readonly tipo: "invalido"; readonly problemas: readonly Problema[] }
  | { readonly tipo: "confirmacao-necessaria"; readonly resumo: string }
  | { readonly tipo: "rejeitado"; readonly erros: readonly ErroFiscal[] }
  | { readonly tipo: "cancelada"; readonly canceladaEm: Date };

const MOTIVOS: readonly MotivoCancelamento[] = ["erro-na-emissao", "servico-nao-prestado", "outros"];

export class CancelarNota {
  constructor(
    private readonly deps: { transmissor: TransmissorFiscal; repositorio: RepositorioDeNotas },
  ) {}

  async executar(pedido: PedidoCancelamentoNota): Promise<ResultadoCancelamento> {
    const problemas: Problema[] = [];
    if (!chaveAcessoValida(pedido.chaveAcesso)) {
      problemas.push({ campo: "chaveAcesso", mensagem: "A chave de acesso da NFS-e tem 50 dígitos." });
    }
    if (!MOTIVOS.includes(pedido.motivo)) {
      problemas.push({
        campo: "motivo",
        mensagem: "Motivo deve ser erro-na-emissao, servico-nao-prestado ou outros.",
      });
    }
    const justificativa = pedido.justificativa?.trim() ?? "";
    if (justificativa.length < JUSTIFICATIVA_MINIMA || justificativa.length > JUSTIFICATIVA_MAXIMA) {
      problemas.push({
        campo: "justificativa",
        mensagem: `A justificativa deve ter entre ${JUSTIFICATIVA_MINIMA} e ${JUSTIFICATIVA_MAXIMA} caracteres.`,
      });
    }
    if (problemas.length > 0) return { tipo: "invalido", problemas };

    if (pedido.ambiente === "producao" && !pedido.confirmado) {
      return {
        tipo: "confirmacao-necessaria",
        resumo: `Cancelar em PRODUÇÃO a NFS-e ${pedido.chaveAcesso}\nMotivo: ${pedido.motivo}\nJustificativa: ${justificativa}`,
      };
    }

    const resposta = await this.deps.transmissor.cancelar({
      chaveAcesso: pedido.chaveAcesso,
      ambiente: pedido.ambiente,
      motivo: pedido.motivo,
      justificativa,
    });
    if (resposta.tipo === "rejeitada") return { tipo: "rejeitado", erros: resposta.erros };

    const local = await this.deps.repositorio.buscarPorChave(pedido.chaveAcesso);
    if (local) await this.deps.repositorio.salvar({ ...local, situacao: "cancelada" });
    return { tipo: "cancelada", canceladaEm: resposta.canceladaEm };
  }
}
