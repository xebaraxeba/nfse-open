import { falha, sucesso, type Resultado } from "./resultado.js";

/**
 * CPF ou CNPJ já validado e normalizado (sem pontuação, letras maiúsculas).
 *
 * O CNPJ aceita o formato alfanumérico da Receita Federal (vigente desde julho de 2026):
 * 12 caracteres de 0-9 ou A-Z seguidos de 2 dígitos verificadores numéricos.
 */
export interface Documento {
  readonly tipo: "CPF" | "CNPJ";
  readonly numero: string;
}

const PONTUACAO = /[.\-/\s]/g;

export function normalizarDocumento(entrada: string): string {
  return entrada.replace(PONTUACAO, "").toUpperCase();
}

function todosIguais(valor: string): boolean {
  return [...valor].every((c) => c === valor[0]);
}

function digitoMod11(valores: number[], pesos: number[]): number {
  const soma = valores.reduce((acc, v, i) => acc + v * (pesos[i] ?? 0), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(entrada: string): boolean {
  const cpf = normalizarDocumento(entrada);
  if (!/^\d{11}$/.test(cpf) || todosIguais(cpf)) return false;
  const d = [...cpf].map(Number);
  const dv1 = digitoMod11(d.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digitoMod11(d.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === d[9] && dv2 === d[10];
}

const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Valor de cada caractere no cálculo do DV: código ASCII menos 48 (0-9 → 0-9, A-Z → 17-42). */
const valorCaractere = (c: string): number => c.charCodeAt(0) - 48;

export function cnpjValido(entrada: string): boolean {
  const cnpj = normalizarDocumento(entrada);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || todosIguais(cnpj)) return false;
  const v = [...cnpj].map(valorCaractere);
  const dv1 = digitoMod11(v.slice(0, 12), PESOS_CNPJ_1);
  const dv2 = digitoMod11(v.slice(0, 13), PESOS_CNPJ_2);
  return dv1 === v[12] && dv2 === v[13];
}

/** Reconhece e valida um CPF ou CNPJ, com ou sem pontuação. */
export function criarDocumento(entrada: string): Resultado<Documento> {
  const numero = normalizarDocumento(entrada ?? "");
  if (numero.length === 11) {
    return cpfValido(numero)
      ? sucesso({ tipo: "CPF", numero })
      : falha({ campo: "", mensagem: `CPF inválido: ${entrada}` });
  }
  if (numero.length === 14) {
    return cnpjValido(numero)
      ? sucesso({ tipo: "CNPJ", numero })
      : falha({ campo: "", mensagem: `CNPJ inválido: ${entrada}` });
  }
  return falha({
    campo: "",
    mensagem: `Documento inválido: informe um CPF (11 dígitos) ou CNPJ (14 caracteres). Recebido: ${entrada}`,
  });
}
