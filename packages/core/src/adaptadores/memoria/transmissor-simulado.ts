import type { Ambiente, Dps } from "../../dominio/dps.js";
import type { Nota } from "../../dominio/nota.js";
import type {
  ErroFiscal,
  PedidoCancelamento,
  RespostaCancelamento,
  RespostaTransmissao,
  TransmissorFiscal,
} from "../../portas/transmissor-fiscal.js";

/**
 * Transmissor que simula a API do governo, sem rede e sem certificado.
 * Útil em testes, exemplos e demonstrações. Nunca gera nota real.
 */
export class TransmissorSimulado implements TransmissorFiscal {
  readonly transmitidas: Dps[] = [];
  private readonly emitidas = new Map<string, Omit<Nota, "dps">>();
  private contador = 0;

  /** Defina para simular uma rejeição na próxima transmissão. */
  proximaRejeicao: ErroFiscal[] | undefined;

  constructor(private readonly agora: () => Date = () => new Date()) {}

  async transmitir(dps: Dps): Promise<RespostaTransmissao> {
    this.transmitidas.push(dps);
    if (this.proximaRejeicao) {
      const erros = this.proximaRejeicao;
      this.proximaRejeicao = undefined;
      return { tipo: "rejeitada", erros };
    }
    this.contador += 1;
    const chaveAcesso = (dps.prestador.municipio + String(this.contador)).padEnd(50, "0").slice(0, 50);
    const autorizadaEm = this.agora();
    const numero = String(this.contador);
    this.emitidas.set(chaveAcesso, {
      chaveAcesso,
      numero,
      ambiente: dps.ambiente,
      autorizadaEm,
      situacao: "autorizada",
    });
    return { tipo: "autorizada", chaveAcesso, numero, autorizadaEm };
  }

  async consultar(chaveAcesso: string, ambiente: Ambiente): Promise<Omit<Nota, "dps"> | undefined> {
    const nota = this.emitidas.get(chaveAcesso);
    return nota && nota.ambiente === ambiente ? nota : undefined;
  }

  async cancelar(pedido: PedidoCancelamento): Promise<RespostaCancelamento> {
    const nota = this.emitidas.get(pedido.chaveAcesso);
    if (!nota || nota.ambiente !== pedido.ambiente) {
      return { tipo: "rejeitada", erros: [{ codigo: "SIMULADO-404", mensagem: "NFS-e não encontrada." }] };
    }
    if (nota.situacao === "cancelada") {
      return { tipo: "rejeitada", erros: [{ codigo: "SIMULADO-409", mensagem: "NFS-e já cancelada." }] };
    }
    this.emitidas.set(pedido.chaveAcesso, { ...nota, situacao: "cancelada" });
    return { tipo: "cancelada", canceladaEm: this.agora() };
  }
}
