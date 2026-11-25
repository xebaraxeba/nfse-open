import type { Nota } from "../dominio/nota.js";

/** Porta para guardar as notas emitidas localmente (por exemplo, em SQLite). */
export interface RepositorioDeNotas {
  /** Reserva o próximo número de DPS da série para o prestador. Nunca repete um número. */
  proximoNumeroDps(documentoPrestador: string, serie: string): Promise<number>;
  salvar(nota: Nota): Promise<void>;
  buscarPorChave(chaveAcesso: string): Promise<Nota | undefined>;
}
