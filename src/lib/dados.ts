import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Perfil = Tables<"profiles">;
export type Experiencia = Tables<"experiences">;
export type Formacao = Tables<"education">;
export type Certificacao = Tables<"certifications">;
export type Habilidade = Tables<"skills">;
export type Vaga = Tables<"job_postings">;
export type Match = Tables<"matches">;

export type Candidatura = Vaga & { matches: Match[] };

function ok<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function usuarioAtual() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada.");
  return data.user;
}

export async function carregarCurriculo() {
  const user = await usuarioAtual();
  const [perfil, experiencias, formacoes, certificacoes, habilidades] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("experiences").select("*").order("ordem").order("created_at"),
    supabase.from("education").select("*").order("ordem").order("created_at"),
    supabase.from("certifications").select("*").order("ordem").order("created_at"),
    supabase.from("skills").select("*").order("ordem").order("created_at"),
  ]);

  return {
    perfil: ok(perfil) as Perfil | null,
    experiencias: ok(experiencias) as Experiencia[],
    formacoes: ok(formacoes) as Formacao[],
    certificacoes: ok(certificacoes) as Certificacao[],
    habilidades: ok(habilidades) as Habilidade[],
  };
}

export async function carregarCandidaturas(): Promise<Candidatura[]> {
  const { data, error } = await supabase
    .from("job_postings")
    .select("*, matches(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Candidatura[];
}

export async function carregarCandidatura(id?: string): Promise<Candidatura | null> {
  let consulta = supabase.from("job_postings").select("*, matches(*)");
  if (id) consulta = consulta.eq("id", id);
  const { data, error } = await consulta.order("created_at", { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  return (data?.[0] as Candidatura | undefined) ?? null;
}
