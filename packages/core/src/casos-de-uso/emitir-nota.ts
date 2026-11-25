import { formatarReais } from "../dominio/dinheiro.js";
import { criarDps, type DadosDps, type Dps } from "../dominio/dps.js";
import type { Nota } from "../dominio/nota.js";
import type { Problema } from "../dominio/resultado.js";
import type { RepositorioDeNotas } from "../portas/repositorio-de-notas.js";
import type { ErroFiscal, TransmissorFiscal } from "../portas/transmissor-fiscal.js";

/** O que quem chama informa. Número da DPS e data de emissão são preenchidos pelo caso de uso. */
export type PedidoEmissao = Omit<DadosDps, "numero" | "emitidaEm"> & {
  /**
   * Em produção a nota tem valor fiscal, então a emissão só acontece com
   * `confirmado: true`, depois de a pessoa ver o resumo.
   */
  confirmado?: boolean;
};

export type ResultadoEmissao =
  | { readonly tipo: "invalida"; readonly problemas: readonly Problema[] }
  | { readonly tipo: "confirmacao-necessaria"; readonly resumo: string }
  | { readonly tipo: "rejeitada"; readonly erros: readonly ErroFiscal[] }
  | { readonly tipo: "emitida"; readonly nota: Nota };

export interface DependenciasEmitirNota {
  readonly transmissor: TransmissorFiscal;
  readonly repositorio: RepositorioDeNotas;
  readonly agora?: () => Date;
}

/** Resumo legível da nota, usado na confirmação antes de emitir. */
export function resumirDps(dps: Omit<Dps, "numero" | "emitidaEm">): string {
  const linhas = [
    `Ambiente: ${dps.ambiente === "producao" ? "PRODUÇÃO (nota com valor fiscal)" : "homologação (teste)"}`,
    `Prestador: ${dps.prestador.nome ?? ""} ${dps.prestador.documento.tipo} ${dps.prestador.documento.numero}`.replace(/\s+/g, " "),
    dps.tomador
      ? `Tomador: ${dps.tomador.nome} (${dps.tomador.documento.tipo} ${dps.tomador.documento.numero})`
      : "Tomador: não identificado",
    `Serviço: ${dps.servico.descricao} (código ${dps.servico.codigoTributacaoNacional})`,
    `Valor: ${formatarReais(dps.valor)}`,
    `Competência: ${dps.competencia}`,
  ];
  return linhas.join("\n");
}

export class EmitirNota {
  private readonly agora: () => Date;

  constructor(private readonly deps: DependenciasEmitirNota) {
    this.agora = deps.agora ?? (() => new Date());
  }

  async executar(pedido: PedidoEmissao): Promise<ResultadoEmissao> {
    const { confirmado = false, ...dados } = pedido;

    // Valida antes de reservar número, para não gastar numeração com dados errados.
    const previa = criarDps({ ...dados, numero: 1, emitidaEm: this.agora() });
    if (!previa.ok) return { tipo: "invalida", problemas: previa.problemas };

    if (dados.ambiente === "producao" && !confirmado) {
      return { tipo: "confirmacao-necessaria", resumo: resumirDps(previa.valor) };
    }

    const numero = await this.deps.repositorio.proximoNumeroDps(
      previa.valor.prestador.documento.numero,
      dados.serie,
    );
    const dps = criarDps({ ...dados, numero, emitidaEm: this.agora() });
    if (!dps.ok) return { tipo: "invalida", problemas: dps.problemas };

    const resposta = await this.deps.transmissor.transmitir(dps.valor);
    if (resposta.tipo === "rejeitada") return { tipo: "rejeitada", erros: resposta.erros };

    const nota: Nota = {
      chaveAcesso: resposta.chaveAcesso,
      numero: resposta.numero,
      ambiente: dps.valor.ambiente,
      autorizadaEm: resposta.autorizadaEm,
      situacao: "autorizada",
      dps: dps.valor,
      ...(resposta.xml !== undefined && { xml: resposta.xml }),
    };
    await this.deps.repositorio.salvar(nota);
    return { tipo: "emitida", nota };
  }
}
