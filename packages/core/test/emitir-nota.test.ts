import { describe, expect, it } from "vitest";
import {
  CancelarNota,
  ConsultarNota,
  EmitirNota,
  RepositorioEmMemoria,
  TransmissorSimulado,
  type PedidoEmissao,
} from "../src/index.js";
import { dadosValidos } from "./fixtures.js";

const AGORA = new Date("2026-11-25T15:00:00Z");

function montar() {
  const transmissor = new TransmissorSimulado(() => AGORA);
  const repositorio = new RepositorioEmMemoria();
  const emitir = new EmitirNota({ transmissor, repositorio, agora: () => AGORA });
  return { transmissor, repositorio, emitir };
}

function pedido(alteracoes: Partial<PedidoEmissao> = {}): PedidoEmissao {
  const { numero: _n, emitidaEm: _e, ...dados } = dadosValidos();
  return { ...dados, ...alteracoes };
}

describe("EmitirNota", () => {
  it("emite em homologação sem pedir confirmação e guarda a nota", async () => {
    const { emitir, repositorio, transmissor } = montar();
    const r = await emitir.executar(pedido());
    expect(r.tipo).toBe("emitida");
    if (r.tipo !== "emitida") return;
    expect(r.nota.chaveAcesso).toMatch(/^\d{50}$/);
    expect(r.nota.situacao).toBe("autorizada");
    expect(r.nota.dps.numero).toBe(1);
    expect(r.nota.dps.emitidaEm).toEqual(AGORA);
    expect(await repositorio.buscarPorChave(r.nota.chaveAcesso)).toEqual(r.nota);
    expect(transmissor.transmitidas).toHaveLength(1);
  });

  it("numera as DPS em sequência por prestador e série", async () => {
    const { emitir } = montar();
    const a = await emitir.executar(pedido());
    const b = await emitir.executar(pedido());
    const c = await emitir.executar(pedido({ serie: "2" }));
    const numeros = [a, b, c].map((r) => (r.tipo === "emitida" ? r.nota.dps.numero : 0));
    expect(numeros).toEqual([1, 2, 1]);
  });

  it("em produção, não emite sem confirmação e devolve um resumo", async () => {
    const { emitir, transmissor } = montar();
    const r = await emitir.executar(pedido({ ambiente: "producao" }));
    expect(r.tipo).toBe("confirmacao-necessaria");
    if (r.tipo !== "confirmacao-necessaria") return;
    expect(r.resumo).toContain("PRODUÇÃO");
    expect(r.resumo).toContain("R$ 1.500,00");
    expect(r.resumo).toContain("João da Silva");
    expect(transmissor.transmitidas).toHaveLength(0);
  });

  it("em produção, emite depois da confirmação", async () => {
    const { emitir } = montar();
    const r = await emitir.executar(pedido({ ambiente: "producao", confirmado: true }));
    expect(r.tipo).toBe("emitida");
  });

  it("não transmite nem gasta numeração quando os dados são inválidos", async () => {
    const { emitir, transmissor, repositorio } = montar();
    const r = await emitir.executar(pedido({ valorCentavos: -5 }));
    expect(r.tipo).toBe("invalida");
    expect(transmissor.transmitidas).toHaveLength(0);
    expect(await repositorio.proximoNumeroDps("11222333000181", "1")).toBe(1);
  });

  it("valida antes de pedir confirmação em produção", async () => {
    const { emitir } = montar();
    const r = await emitir.executar(pedido({ ambiente: "producao", valorCentavos: 0 }));
    expect(r.tipo).toBe("invalida");
  });

  it("repassa a rejeição do governo sem guardar nota", async () => {
    const { emitir, transmissor, repositorio } = montar();
    transmissor.proximaRejeicao = [{ codigo: "E0001", mensagem: "Código de serviço não permitido" }];
    const r = await emitir.executar(pedido());
    expect(r).toEqual({
      tipo: "rejeitada",
      erros: [{ codigo: "E0001", mensagem: "Código de serviço não permitido" }],
    });
    expect(repositorio.listar()).toHaveLength(0);
  });
});

describe("ConsultarNota e CancelarNota", () => {
  async function emitida() {
    const ctx = montar();
    const r = await ctx.emitir.executar(pedido());
    if (r.tipo !== "emitida") throw new Error("deveria emitir");
    return { ...ctx, nota: r.nota };
  }

  it("consulta uma nota emitida", async () => {
    const { transmissor, repositorio, nota } = await emitida();
    const r = await new ConsultarNota({ transmissor, repositorio }).executar(nota.chaveAcesso, "homologacao");
    expect(r.tipo).toBe("encontrada");
    if (r.tipo === "encontrada") expect(r.nota.dps?.servico.descricao).toBe("Consultoria em sistemas");
  });

  it("recusa chave em formato errado e informa nota inexistente", async () => {
    const { transmissor, repositorio } = montar();
    const consultar = new ConsultarNota({ transmissor, repositorio });
    expect((await consultar.executar("123", "homologacao")).tipo).toBe("chave-invalida");
    expect((await consultar.executar("1".repeat(50), "homologacao")).tipo).toBe("nao-encontrada");
  });

  it("cancela e atualiza a situação local", async () => {
    const { transmissor, repositorio, nota } = await emitida();
    const r = await new CancelarNota({ transmissor, repositorio }).executar({
      chaveAcesso: nota.chaveAcesso,
      ambiente: "homologacao",
      motivo: "erro-na-emissao",
      justificativa: "Valor digitado errado na nota",
    });
    expect(r.tipo).toBe("cancelada");
    expect((await repositorio.buscarPorChave(nota.chaveAcesso))?.situacao).toBe("cancelada");
  });

  it("exige justificativa de 15 a 255 caracteres", async () => {
    const { transmissor, repositorio, nota } = await emitida();
    const r = await new CancelarNota({ transmissor, repositorio }).executar({
      chaveAcesso: nota.chaveAcesso,
      ambiente: "homologacao",
      motivo: "outros",
      justificativa: "curta",
    });
    expect(r.tipo).toBe("invalido");
  });

  it("pede confirmação para cancelar em produção", async () => {
    const { transmissor, repositorio } = montar();
    const r = await new CancelarNota({ transmissor, repositorio }).executar({
      chaveAcesso: "1".repeat(50),
      ambiente: "producao",
      motivo: "servico-nao-prestado",
      justificativa: "Serviço não foi prestado ao cliente",
    });
    expect(r.tipo).toBe("confirmacao-necessaria");
  });
});
