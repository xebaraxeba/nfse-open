import type { Ambiente } from "../dominio/dps.js";
import { chaveAcessoValida, type Nota } from "../dominio/nota.js";
import type { RepositorioDeNotas } from "../portas/repositorio-de-notas.js";
import type { TransmissorFiscal } from "../portas/transmissor-fiscal.js";

export type ResultadoConsulta =
  | { readonly tipo: "chave-invalida"; readonly mensagem: string }
  | { readonly tipo: "nao-encontrada" }
  | { readonly tipo: "encontrada"; readonly nota: Omit<Nota, "dps"> & Partial<Pick<Nota, "dps">> };

export class ConsultarNota {
  constructor(
    private readonly deps: { transmissor: TransmissorFiscal; repositorio: RepositorioDeNotas },
  ) {}

  /** Consulta a situação atual no governo e completa com os dados guardados localmente. */
  async executar(chaveAcesso: string, ambiente: Ambiente): Promise<ResultadoConsulta> {
    if (!chaveAcessoValida(chaveAcesso)) {
      return { tipo: "chave-invalida", mensagem: "A chave de acesso da NFS-e tem 50 dígitos." };
    }
    const remota = await this.deps.transmissor.consultar(chaveAcesso, ambiente);
    if (!remota) return { tipo: "nao-encontrada" };
    const local = await this.deps.repositorio.buscarPorChave(chaveAcesso);
    if (local && local.situacao !== remota.situacao) {
      await this.deps.repositorio.salvar({ ...local, situacao: remota.situacao });
    }
    return { tipo: "encontrada", nota: local ? { ...local, ...remota } : remota };
  }
}
