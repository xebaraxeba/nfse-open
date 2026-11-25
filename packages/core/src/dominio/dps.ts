import { dinheiroDeCentavos, type Dinheiro } from "./dinheiro.js";
import { criarDocumento, type Documento } from "./documento.js";
import { falha, prefixar, sucesso, type Problema, type Resultado } from "./resultado.js";

/** Ambiente da NFS-e nacional: homologação (testes, sem valor fiscal) ou produção. */
export type Ambiente = "homologacao" | "producao";

/** Situação do prestador perante o Simples Nacional. */
export type RegimeSimplesNacional = "nao-optante" | "mei" | "me-epp";

export interface Prestador {
  readonly documento: Documento;
  /** Código IBGE de 7 dígitos do município do prestador. */
  readonly municipio: string;
  readonly regime: RegimeSimplesNacional;
  readonly nome?: string;
  readonly email?: string;
}

export interface Tomador {
  readonly documento: Documento;
  readonly nome: string;
  readonly email?: string;
}

export interface Servico {
  /** Código de tributação nacional (cTribNac), 6 dígitos: item, subitem e desdobro da LC 116/2003. */
  readonly codigoTributacaoNacional: string;
  readonly descricao: string;
  /** Código IBGE de 7 dígitos do município onde o serviço foi prestado. */
  readonly municipioPrestacao: string;
}

/**
 * DPS: Declaração de Prestação de Serviço. É o documento que o prestador envia;
 * depois de autorizado, vira a NFS-e.
 */
export interface Dps {
  readonly ambiente: Ambiente;
  readonly serie: string;
  readonly numero: number;
  /** Data de competência no formato AAAA-MM-DD. */
  readonly competencia: string;
  readonly emitidaEm: Date;
  readonly prestador: Prestador;
  readonly tomador?: Tomador;
  readonly servico: Servico;
  readonly valor: Dinheiro;
}

/** Dados de entrada, ainda não validados, como chegam da CLI, do chat ou da API. */
export interface DadosDps {
  ambiente: Ambiente;
  serie: string;
  numero: number;
  competencia: string;
  emitidaEm: Date;
  prestador: {
    documento: string;
    municipio: string;
    regime: RegimeSimplesNacional;
    nome?: string;
    email?: string;
  };
  tomador?: {
    documento: string;
    nome: string;
    email?: string;
  };
  servico: {
    codigoTributacaoNacional: string;
    descricao: string;
    municipioPrestacao: string;
  };
  valorCentavos: number;
}

export const LIMITE_DESCRICAO = 2000;
export const NUMERO_DPS_MAXIMO = 999_999_999_999_999;

const AMBIENTES: readonly Ambiente[] = ["homologacao", "producao"];
const REGIMES: readonly RegimeSimplesNacional[] = ["nao-optante", "mei", "me-epp"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function dataIsoValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(texto);
}

function validarMunicipio(campo: string, codigo: string, problemas: Problema[]): void {
  if (!/^\d{7}$/.test(codigo ?? "")) {
    problemas.push({ campo, mensagem: "Informe o código IBGE do município, com 7 dígitos." });
  }
}

function validarEmail(campo: string, email: string | undefined, problemas: Problema[]): void {
  if (email !== undefined && !EMAIL.test(email)) {
    problemas.push({ campo, mensagem: `E-mail inválido: ${email}` });
  }
}

/**
 * Valida todos os campos de uma DPS de uma vez e devolve a lista completa de
 * problemas, para que o usuário corrija tudo numa rodada só.
 */
export function criarDps(dados: DadosDps): Resultado<Dps> {
  const problemas: Problema[] = [];

  if (!AMBIENTES.includes(dados.ambiente)) {
    problemas.push({ campo: "ambiente", mensagem: "Ambiente deve ser homologacao ou producao." });
  }
  if (!/^\d{1,5}$/.test(dados.serie ?? "")) {
    problemas.push({ campo: "serie", mensagem: "A série deve ter de 1 a 5 dígitos." });
  }
  if (!Number.isSafeInteger(dados.numero) || dados.numero < 1 || dados.numero > NUMERO_DPS_MAXIMO) {
    problemas.push({ campo: "numero", mensagem: "O número da DPS deve ser um inteiro de 1 a 15 dígitos." });
  }
  if (!dataIsoValida(dados.competencia ?? "")) {
    problemas.push({ campo: "competencia", mensagem: "A competência deve ser uma data no formato AAAA-MM-DD." });
  }
  if (!(dados.emitidaEm instanceof Date) || Number.isNaN(dados.emitidaEm.getTime())) {
    problemas.push({ campo: "emitidaEm", mensagem: "Data de emissão inválida." });
  }

  // Prestador
  const docPrestador = criarDocumento(dados.prestador?.documento);
  if (!docPrestador.ok) problemas.push(...prefixar("prestador.documento", docPrestador.problemas));
  validarMunicipio("prestador.municipio", dados.prestador?.municipio, problemas);
  if (!REGIMES.includes(dados.prestador?.regime)) {
    problemas.push({ campo: "prestador.regime", mensagem: "Regime deve ser nao-optante, mei ou me-epp." });
  }
  validarEmail("prestador.email", dados.prestador?.email, problemas);

  // Tomador (opcional na DPS, mas, se vier, precisa estar completo)
  let docTomador: Resultado<Documento> | undefined;
  if (dados.tomador) {
    docTomador = criarDocumento(dados.tomador.documento);
    if (!docTomador.ok) problemas.push(...prefixar("tomador.documento", docTomador.problemas));
    if (!dados.tomador.nome?.trim()) {
      problemas.push({ campo: "tomador.nome", mensagem: "Informe o nome ou a razão social do tomador." });
    }
    validarEmail("tomador.email", dados.tomador.email, problemas);
    if (
      docPrestador.ok &&
      docTomador.ok &&
      docPrestador.valor.numero === docTomador.valor.numero
    ) {
      problemas.push({ campo: "tomador.documento", mensagem: "O tomador não pode ser o próprio prestador." });
    }
  }

  // Serviço
  const servico = dados.servico;
  if (!/^\d{6}$/.test(servico?.codigoTributacaoNacional ?? "")) {
    problemas.push({
      campo: "servico.codigoTributacaoNacional",
      mensagem: "O código de tributação nacional deve ter 6 dígitos (item, subitem e desdobro).",
    });
  }
  const descricao = servico?.descricao?.trim() ?? "";
  if (!descricao) {
    problemas.push({ campo: "servico.descricao", mensagem: "Descreva o serviço prestado." });
  } else if (descricao.length > LIMITE_DESCRICAO) {
    problemas.push({
      campo: "servico.descricao",
      mensagem: `A descrição do serviço passa de ${LIMITE_DESCRICAO} caracteres.`,
    });
  }
  validarMunicipio("servico.municipioPrestacao", servico?.municipioPrestacao, problemas);

  // Valor
  const valor = dinheiroDeCentavos(dados.valorCentavos);
  if (!valor.ok) problemas.push(...prefixar("valor", valor.problemas));

  if (problemas.length > 0 || !docPrestador.ok || !valor.ok || (docTomador && !docTomador.ok)) {
    return falha(...problemas);
  }

  const { prestador, tomador } = dados;
  return sucesso({
    ambiente: dados.ambiente,
    serie: dados.serie,
    numero: dados.numero,
    competencia: dados.competencia,
    emitidaEm: dados.emitidaEm,
    prestador: {
      documento: docPrestador.valor,
      municipio: prestador.municipio,
      regime: prestador.regime,
      ...(prestador.nome !== undefined && { nome: prestador.nome.trim() }),
      ...(prestador.email !== undefined && { email: prestador.email }),
    },
    ...(tomador && docTomador?.ok && {
      tomador: {
        documento: docTomador.valor,
        nome: tomador.nome.trim(),
        ...(tomador.email !== undefined && { email: tomador.email }),
      },
    }),
    servico: {
      codigoTributacaoNacional: servico.codigoTributacaoNacional,
      descricao,
      municipioPrestacao: servico.municipioPrestacao,
    },
    valor: valor.valor,
  });
}

/**
 * Identificador da DPS no padrão nacional (45 caracteres):
 * "DPS" + município emissor (7) + tipo de inscrição (1 = CPF, 2 = CNPJ)
 * + inscrição federal (14, CPF completado com zeros à esquerda) + série (5) + número (15).
 */
export function identificadorDps(dps: Dps): string {
  const { documento, municipio } = dps.prestador;
  const tipoInscricao = documento.tipo === "CPF" ? "1" : "2";
  return [
    "DPS",
    municipio,
    tipoInscricao,
    documento.numero.padStart(14, "0"),
    dps.serie.padStart(5, "0"),
    String(dps.numero).padStart(15, "0"),
  ].join("");
}
