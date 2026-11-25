import type { Nota } from "../../dominio/nota.js";
import type { RepositorioDeNotas } from "../../portas/repositorio-de-notas.js";

/** Repositório em memória, para testes e exemplos. Os dados somem ao fechar o processo. */
export class RepositorioEmMemoria implements RepositorioDeNotas {
  private readonly notas = new Map<string, Nota>();
  private readonly sequencias = new Map<string, number>();

  async proximoNumeroDps(documentoPrestador: string, serie: string): Promise<number> {
    const chave = `${documentoPrestador}:${serie}`;
    const proximo = (this.sequencias.get(chave) ?? 0) + 1;
    this.sequencias.set(chave, proximo);
    return proximo;
  }

  async salvar(nota: Nota): Promise<void> {
    this.notas.set(nota.chaveAcesso, nota);
  }

  async buscarPorChave(chaveAcesso: string): Promise<Nota | undefined> {
    return this.notas.get(chaveAcesso);
  }

  listar(): Nota[] {
    return [...this.notas.values()];
  }
}
