export type StatusCandidatura = "rascunho" | "aplicado" | "entrevista" | "rejeitado" | "aceito";
export type Idioma = "pt" | "en";
export type CategoriaHabilidade = "técnica" | "ferramenta" | "soft skill";

export const STATUS_LABEL: Record<StatusCandidatura, string> = {
  rascunho: "Rascunho",
  aplicado: "Aplicado",
  entrevista: "Entrevista",
  rejeitado: "Rejeitado",
  aceito: "Aceito",
};

export const CATEGORIAS: CategoriaHabilidade[] = ["técnica", "ferramenta", "soft skill"];

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}
