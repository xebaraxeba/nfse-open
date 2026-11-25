import { describe, expect, it } from "vitest";
import { cnpjValido, cpfValido, criarDocumento } from "../src/index.js";

describe("CPF", () => {
  it("aceita CPF válido com ou sem pontuação", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
  });

  it("recusa dígito verificador errado, tamanho errado e sequências repetidas", () => {
    expect(cpfValido("529.982.247-24")).toBe(false);
    expect(cpfValido("5299822472")).toBe(false);
    expect(cpfValido("111.111.111-11")).toBe(false);
  });
});

describe("CNPJ", () => {
  it("aceita CNPJ numérico válido", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
  });

  it("aceita CNPJ alfanumérico válido (exemplo oficial da Receita)", () => {
    expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
    expect(cnpjValido("12abc34501de35")).toBe(true);
  });

  it("recusa CNPJ com DV errado, letras nos DVs e sequências repetidas", () => {
    expect(cnpjValido("11.222.333/0001-82")).toBe(false);
    expect(cnpjValido("12ABC34501DE3A")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
  });
});

describe("criarDocumento", () => {
  it("reconhece o tipo pelo tamanho e normaliza", () => {
    expect(criarDocumento("529.982.247-25")).toEqual({
      ok: true,
      valor: { tipo: "CPF", numero: "52998224725" },
    });
    expect(criarDocumento("12.abc.345/01de-35")).toEqual({
      ok: true,
      valor: { tipo: "CNPJ", numero: "12ABC34501DE35" },
    });
  });

  it("explica o erro em português", () => {
    const r = criarDocumento("123");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas[0]?.mensagem).toMatch(/CPF \(11 dígitos\) ou CNPJ/);
  });
});
