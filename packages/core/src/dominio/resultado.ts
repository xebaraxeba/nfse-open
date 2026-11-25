/** Um problema encontrado ao validar os dados de uma nota. */
export interface Problema {
  /** Caminho do campo com problema, por exemplo `tomador.documento`. */
  readonly campo: string;
  /** Mensagem em português, pronta para mostrar ao usuário. */
  readonly mensagem: string;
}

export type Resultado<T> =
  | { readonly ok: true; readonly valor: T }
  | { readonly ok: false; readonly problemas: readonly Problema[] };

export const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });

export const falha = <T = never>(...problemas: Problema[]): Resultado<T> => ({
  ok: false,
  problemas,
});

/** Prefixa o campo de cada problema, para validar objetos aninhados. */
export const prefixar = (prefixo: string, problemas: readonly Problema[]): Problema[] =>
  problemas.map((p) => ({ ...p, campo: p.campo ? `${prefixo}.${p.campo}` : prefixo }));
