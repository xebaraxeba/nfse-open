import { describe, expect, it } from "vitest";
import { criarDps, identificadorDps } from "../src/index.js";
import { CNPJ_PRESTADOR, dadosValidos, SAO_PAULO } from "./fixtures.js";

const campos = (r: ReturnType<typeof criarDps>) => (r.ok ? [] : r.problemas.map((p) => p.campo));

describe("criarDps", () => {
  it("aceita uma DPS completa e normaliza os documentos", () => {
    const r = criarDps(dadosValidos());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.valor.prestador.documento).toEqual({ tipo: "CNPJ", numero: "11222333000181" });
      expect(r.valor.tomador?.documento).toEqual({ tipo: "CPF", numero: "52998224725" });
    }
  });

  it("aceita DPS sem tomador identificado", () => {
    const { tomador: _, ...semTomador } = dadosValidos();
    expect(criarDps(semTomador).ok).toBe(true);
  });

  it("devolve todos os problemas de uma vez", () => {
    const r = criarDps(
      dadosValidos({
        serie: "123456",
        competencia: "2026-02-30",
        prestador: { documento: "123", municipio: "35", regime: "mei" },
        tomador: { documento: "529.982.247-24", nome: " " },
        servico: { codigoTributacaoNacional: "1.01", descricao: "", municipioPrestacao: SAO_PAULO },
        valorCentavos: 0,
      }),
    );
    expect(campos(r).sort()).toEqual(
      [
        "competencia",
        "prestador.documento",
        "prestador.municipio",
        "serie",
        "servico.codigoTributacaoNacional",
        "servico.descricao",
        "tomador.documento",
        "tomador.nome",
        "valor",
      ].sort(),
    );
  });

  it("recusa tomador igual ao prestador", () => {
    const r = criarDps(dadosValidos({ tomador: { documento: CNPJ_PRESTADOR, nome: "Eu mesmo" } }));
    expect(campos(r)).toEqual(["tomador.documento"]);
  });

  it("recusa descrição acima de 2000 caracteres e e-mail inválido", () => {
    const base = dadosValidos();
    const r = criarDps({
      ...base,
      servico: { ...base.servico, descricao: "x".repeat(2001) },
      tomador: { documento: "529.982.247-25", nome: "João", email: "joao@" },
    });
    expect(campos(r).sort()).toEqual(["servico.descricao", "tomador.email"]);
  });
});

describe("identificadorDps", () => {
  it("segue o leiaute nacional de 45 caracteres", () => {
    const r = criarDps(dadosValidos({ serie: "1", numero: 42 }));
    if (!r.ok) throw new Error("DPS deveria ser válida");
    const id = identificadorDps(r.valor);
    expect(id).toHaveLength(45);
    expect(id).toBe(["DPS", SAO_PAULO, "2", "11222333000181", "00001", "000000000000042"].join(""));
  });

  it("completa CPF do prestador com zeros e usa tipo de inscrição 1", () => {
    const r = criarDps(
      dadosValidos({
        prestador: { documento: "529.982.247-25", municipio: SAO_PAULO, regime: "mei" },
        tomador: { documento: CNPJ_PRESTADOR, nome: "Empresa" },
      }),
    );
    if (!r.ok) throw new Error("DPS deveria ser válida");
    expect(identificadorDps(r.valor).slice(10, 25)).toBe("100052998224725");
  });
});
