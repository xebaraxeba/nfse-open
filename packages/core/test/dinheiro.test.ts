import { describe, expect, it } from "vitest";
import { dinheiroDeCentavos, dinheiroDeTexto, formatarDecimal, formatarReais } from "../src/index.js";

const centavos = (texto: string) => {
  const r = dinheiroDeTexto(texto);
  return r.ok ? r.valor.centavos : undefined;
};

describe("dinheiro", () => {
  it.each([
    ["1500", 150000],
    ["1500,5", 150050],
    ["1.500,50", 150050],
    ["R$ 1.500,50", 150050],
    ["1500.5", 150050],
    ["1.500", 150000],
    ["0,01", 1],
    ["1.234.567,89", 123456789],
  ])("lê %s", (texto, esperado) => {
    expect(centavos(texto)).toBe(esperado);
  });

  it.each(["", "abc", "1,2,3", "-10", "0", "1,234"])("recusa %j", (texto) => {
    expect(dinheiroDeTexto(texto).ok).toBe(false);
  });

  it("recusa centavos não inteiros, zero e negativos", () => {
    expect(dinheiroDeCentavos(10.5).ok).toBe(false);
    expect(dinheiroDeCentavos(0).ok).toBe(false);
    expect(dinheiroDeCentavos(-1).ok).toBe(false);
  });

  it("formata para o XML e para pessoas", () => {
    expect(formatarDecimal({ centavos: 150005 })).toBe("1500.05");
    expect(formatarReais({ centavos: 123456789 })).toBe("R$ 1.234.567,89");
  });
});
