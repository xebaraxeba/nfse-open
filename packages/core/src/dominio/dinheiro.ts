import { falha, sucesso, type Resultado } from "./resultado.js";

/**
 * Valor em reais guardado em centavos inteiros, para nunca perder precisão
 * com ponto flutuante.
 */
export interface Dinheiro {
  readonly centavos: number;
}

/** Limite do campo de valor da DPS: 13 dígitos inteiros e 2 decimais. */
const MAXIMO_CENTAVOS = 999_999_999_999_999;

export function dinheiroDeCentavos(centavos: number): Resultado<Dinheiro> {
  if (!Number.isSafeInteger(centavos)) {
    return falha({ campo: "", mensagem: "O valor precisa ser um número inteiro de centavos." });
  }
  if (centavos <= 0) {
    return falha({ campo: "", mensagem: "O valor do serviço precisa ser maior que zero." });
  }
  if (centavos > MAXIMO_CENTAVOS) {
    return falha({ campo: "", mensagem: "O valor do serviço passa do limite permitido." });
  }
  return sucesso({ centavos });
}

/**
 * Lê um valor em reais escrito por uma pessoa: `1500`, `1500,50`, `1.500,50`,
 * `1500.5` ou `R$ 1.500,50`.
 */
export function dinheiroDeTexto(texto: string): Resultado<Dinheiro> {
  const limpo = (texto ?? "").replace(/R\$|\s/g, "");
  const brasileiro = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/;
  const internacional = /^\d+(\.\d{1,2})?$/;
  let normalizado: string;
  if (internacional.test(limpo) && !/^\d{1,3}\.\d{3}$/.test(limpo)) {
    normalizado = limpo;
  } else if (brasileiro.test(limpo)) {
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    return falha({ campo: "", mensagem: `Valor inválido: ${texto}. Use, por exemplo, 1500,00.` });
  }
  const [inteiros = "0", decimais = ""] = normalizado.split(".");
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
  return dinheiroDeCentavos(centavos);
}

/** Formata como decimal com ponto, no formato usado pelo XML da DPS: `1500.00`. */
export function formatarDecimal(valor: Dinheiro): string {
  const reais = Math.trunc(valor.centavos / 100);
  const centavos = String(valor.centavos % 100).padStart(2, "0");
  return `${reais}.${centavos}`;
}

/** Formata para leitura humana: `R$ 1.500,00`. */
export function formatarReais(valor: Dinheiro): string {
  const reais = Math.trunc(valor.centavos / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centavos = String(valor.centavos % 100).padStart(2, "0");
  return `R$ ${reais},${centavos}`;
}
