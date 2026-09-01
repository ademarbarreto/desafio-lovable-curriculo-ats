import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { carregarCurriculo, usuarioAtual } from "@/lib/dados";
import { CATEGORIAS, type CategoriaHabilidade } from "@/lib/dominio";

export const Route = createFileRoute("/_authenticated/curriculo")({
  head: () => ({
    meta: [
      { title: "Meu Currículo — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Sua fonte de verdade: dados pessoais, experiências, formação, certificações e habilidades. Nada é preenchido pela IA.",
      },
      { property: "og:title", content: "Meu Currículo — Currículo Certeiro" },
      {
        property: "og:description",
        content: "O currículo-base que alimenta toda adaptação para vagas.",
      },
    ],
  }),
  component: MeuCurriculo,
});

type Perfil = {
  nome_completo: string;
  titulo_profissional: string;
  email: string;
  telefone: string;
  localizacao: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  resumo: string;
};

type Exp = { id?: string; empresa: string; cargo: string; data_inicio: string; data_fim: string; descricao: string };
type Edu = { id?: string; instituicao: string; curso: string; data_inicio: string; data_fim: string };
type Cert = { id?: string; nome: string; emissor: string; data_emissao: string; data_validade: string };
type Hab = { id?: string; nome: string; categoria: CategoriaHabilidade };

const PERFIL_VAZIO: Perfil = {
  nome_completo: "",
  titulo_profissional: "",
  email: "",
  telefone: "",
  localizacao: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  resumo: "",
};

function Campo({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="label-tech">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      />
    </div>
  );
}

function MeuCurriculo() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["curriculo"], queryFn: carregarCurriculo });

  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
  const [experiencias, setExperiencias] = useState<Exp[]>([]);
  const [formacoes, setFormacoes] = useState<Edu[]>([]);
  const [certificacoes, setCertificacoes] = useState<Cert[]>([]);
  const [habilidades, setHabilidades] = useState<Hab[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!data) return;
    setPerfil({ ...PERFIL_VAZIO, ...(data.perfil ?? {}) });
    setExperiencias(
      data.experiencias.map((e) => ({
        id: e.id,
        empresa: e.empresa,
        cargo: e.cargo,
        data_inicio: e.data_inicio,
        data_fim: e.data_fim,
        descricao: e.descricao,
      })),
    );
    setFormacoes(
      data.formacoes.map((f) => ({
        id: f.id,
        instituicao: f.instituicao,
        curso: f.curso,
        data_inicio: f.data_inicio,
        data_fim: f.data_fim,
      })),
    );
    setCertificacoes(
      data.certificacoes.map((c) => ({
        id: c.id,
        nome: c.nome,
        emissor: c.emissor,
        data_emissao: c.data_emissao,
        data_validade: c.data_validade,
      })),
    );
    setHabilidades(
      data.habilidades.map((h) => ({
        id: h.id,
        nome: h.nome,
        categoria: h.categoria as CategoriaHabilidade,
      })),
    );
  }, [data]);

  async function salvar() {
    setSalvando(true);
    try {
      const user = await usuarioAtual();
      const uid = user.id;

      const erroPerfil = (await supabase.from("profiles").upsert({ id: uid, ...perfil })).error;
      if (erroPerfil) throw new Error(erroPerfil.message);

      const removidos = async (tabela: "experiences" | "education" | "certifications" | "skills", mantidos: string[]) => {
        let q = supabase.from(tabela).delete().eq("user_id", uid);
        if (mantidos.length) q = q.not("id", "in", `(${mantidos.join(",")})`);
        const { error } = await q;
        if (error) throw new Error(error.message);
      };

      await removidos("experiences", experiencias.filter((e) => e.id).map((e) => e.id!));
      await removidos("education", formacoes.filter((f) => f.id).map((f) => f.id!));
      await removidos("certifications", certificacoes.filter((c) => c.id).map((c) => c.id!));
      await removidos("skills", habilidades.filter((h) => h.id).map((h) => h.id!));

      const inserir = async (tabela: string, linhas: Record<string, unknown>[]) => {
        const novos = linhas
          .filter((l) => !l['id'])
          .map(({ id: _id, ...resto }) => resto);
        const existentes = linhas.filter((l) => l['id']);

        if (novos.length) {
          const { error } = await supabase.from(tabela as "experiences").insert(novos as never);
          if (error) throw new Error(error.message);
        }
        if (existentes.length) {
          const { error } = await supabase.from(tabela as "experiences").upsert(existentes as never);
          if (error) throw new Error(error.message);
        }
      };

      await inserir(
        "experiences",
        experiencias.map((e, i) => ({ ...e, user_id: uid, ordem: i })),
      );
      await inserir(
        "education",
        formacoes.map((f, i) => ({ ...f, user_id: uid, ordem: i })),
      );
      await inserir(
        "certifications",
        certificacoes.map((c, i) => ({ ...c, user_id: uid, ordem: i })),
      );
      await inserir(
        "skills",
        habilidades
          .filter((h) => h.nome.trim())
          .map((h, i) => ({ ...h, user_id: uid, ordem: i })),
      );


      await queryClient.invalidateQueries();
      toast.success("Currículo-base salvo.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell
      titulo="Meu Currículo"
      descricao="Esta é a única fonte de verdade. Tudo que for gerado para uma vaga sai daqui — nada é inventado."
      acao={
        <Button onClick={salvar} disabled={salvando || isLoading}>
          {salvando ? "Salvando…" : "Salvar currículo-base"}
        </Button>
      }
    >
      <Alert className="border-primary/25 bg-primary/5">
        <ShieldCheck className="size-4 text-primary" />
        <AlertTitle className="text-sm">Preenchimento apenas seu</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          A IA nunca escreve nesta página. Ela só reorganiza e prioriza o que já existe aqui.
        </AlertDescription>
      </Alert>

      <Card className="mt-6 border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <Campo id="nome" label="Nome completo" value={perfil.nome_completo} onChange={(v) => setPerfil({ ...perfil, nome_completo: v })} />
          <Campo id="titulo" label="Título profissional" value={perfil.titulo_profissional} onChange={(v) => setPerfil({ ...perfil, titulo_profissional: v })} />
          <Campo id="email" label="E-mail" value={perfil.email} onChange={(v) => setPerfil({ ...perfil, email: v })} />
          <Campo id="telefone" label="Telefone" value={perfil.telefone} onChange={(v) => setPerfil({ ...perfil, telefone: v })} />
          <Campo id="local" label="Localização" value={perfil.localizacao} onChange={(v) => setPerfil({ ...perfil, localizacao: v })} />
          <Campo id="linkedin" label="LinkedIn" value={perfil.linkedin_url} onChange={(v) => setPerfil({ ...perfil, linkedin_url: v })} />
          <Campo id="github" label="GitHub" value={perfil.github_url} onChange={(v) => setPerfil({ ...perfil, github_url: v })} />
          <Campo id="portfolio" label="Portfólio" value={perfil.portfolio_url} onChange={(v) => setPerfil({ ...perfil, portfolio_url: v })} />
          <div className="sm:col-span-2">
            <Label htmlFor="resumo" className="label-tech">
              Resumo
            </Label>
            <Textarea
              id="resumo"
              value={perfil.resumo}
              onChange={(e) => setPerfil({ ...perfil, resumo: e.target.value })}
              rows={4}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-base">Experiências</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setExperiencias([
                ...experiencias,
                { empresa: "", cargo: "", data_inicio: "", data_fim: "", descricao: "" },
              ])
            }
          >
            <Plus /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          {experiencias.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma experiência cadastrada ainda — adicione a primeira.
            </p>
          ) : (
            experiencias.map((exp, i) => (
              <div key={exp.id ?? `nova-${i}`}>
                {i > 0 ? <Separator className="mb-6" /> : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id={`emp-${i}`} label="Empresa" value={exp.empresa} onChange={(v) => setExperiencias(experiencias.map((x, j) => (j === i ? { ...x, empresa: v } : x)))} />
                  <Campo id={`car-${i}`} label="Cargo" value={exp.cargo} onChange={(v) => setExperiencias(experiencias.map((x, j) => (j === i ? { ...x, cargo: v } : x)))} />
                  <Campo id={`ini-${i}`} label="Data de início" value={exp.data_inicio} onChange={(v) => setExperiencias(experiencias.map((x, j) => (j === i ? { ...x, data_inicio: v } : x)))} />
                  <Campo id={`fim-${i}`} label="Data de fim (vazio = emprego atual)" placeholder="emprego atual" value={exp.data_fim} onChange={(v) => setExperiencias(experiencias.map((x, j) => (j === i ? { ...x, data_fim: v } : x)))} />
                  <div className="sm:col-span-2">
                    <Label htmlFor={`desc-${i}`} className="label-tech">
                      Descrição
                    </Label>
                    <Textarea
                      id={`desc-${i}`}
                      value={exp.descricao}
                      onChange={(e) =>
                        setExperiencias(
                          experiencias.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)),
                        )
                      }
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-muted-foreground"
                  onClick={() => setExperiencias(experiencias.filter((_, j) => j !== i))}
                >
                  <Trash2 /> Remover
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base">Formação</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFormacoes([...formacoes, { instituicao: "", curso: "", data_inicio: "", data_fim: "" }])
              }
            >
              <Plus /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {formacoes.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma formação cadastrada ainda — adicione a primeira.
              </p>
            ) : (
              formacoes.map((f, i) => (
                <div key={f.id ?? `nova-${i}`} className="grid gap-4 sm:grid-cols-2">
                  <Campo id={`inst-${i}`} label="Instituição" value={f.instituicao} onChange={(v) => setFormacoes(formacoes.map((x, j) => (j === i ? { ...x, instituicao: v } : x)))} />
                  <Campo id={`curso-${i}`} label="Curso" value={f.curso} onChange={(v) => setFormacoes(formacoes.map((x, j) => (j === i ? { ...x, curso: v } : x)))} />
                  <Campo id={`fini-${i}`} label="Início" value={f.data_inicio} onChange={(v) => setFormacoes(formacoes.map((x, j) => (j === i ? { ...x, data_inicio: v } : x)))} />
                  <Campo id={`ffim-${i}`} label="Fim" value={f.data_fim} onChange={(v) => setFormacoes(formacoes.map((x, j) => (j === i ? { ...x, data_fim: v } : x)))} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-self-start text-muted-foreground"
                    onClick={() => setFormacoes(formacoes.filter((_, j) => j !== i))}
                  >
                    <Trash2 /> Remover
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base">Certificações</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCertificacoes([
                  ...certificacoes,
                  { nome: "", emissor: "", data_emissao: "", data_validade: "" },
                ])
              }
            >
              <Plus /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {certificacoes.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma certificação cadastrada ainda — adicione a primeira.
              </p>
            ) : (
              certificacoes.map((c, i) => (
                <div key={c.id ?? `nova-${i}`} className="grid gap-4 sm:grid-cols-2">
                  <Campo id={`cn-${i}`} label="Nome" value={c.nome} onChange={(v) => setCertificacoes(certificacoes.map((x, j) => (j === i ? { ...x, nome: v } : x)))} />
                  <Campo id={`ce-${i}`} label="Emissor" value={c.emissor} onChange={(v) => setCertificacoes(certificacoes.map((x, j) => (j === i ? { ...x, emissor: v } : x)))} />
                  <Campo id={`cem-${i}`} label="Emissão" value={c.data_emissao} onChange={(v) => setCertificacoes(certificacoes.map((x, j) => (j === i ? { ...x, data_emissao: v } : x)))} />
                  <Campo id={`cv-${i}`} label="Validade" value={c.data_validade} onChange={(v) => setCertificacoes(certificacoes.map((x, j) => (j === i ? { ...x, data_validade: v } : x)))} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-self-start text-muted-foreground"
                    onClick={() => setCertificacoes(certificacoes.filter((_, j) => j !== i))}
                  >
                    <Trash2 /> Remover
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Habilidades</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {habilidades.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma habilidade cadastrada ainda — adicione a primeira para a análise funcionar.
            </p>
          ) : (
            <div className="space-y-3">
              {habilidades.map((h, i) => (
                <div key={h.id ?? `nova-${i}`} className="flex flex-wrap items-center gap-3">
                  <Input
                    value={h.nome}
                    placeholder="Ex.: PostgreSQL"
                    onChange={(e) =>
                      setHabilidades(habilidades.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))
                    }
                    className="max-w-xs"
                  />
                  <Select
                    value={h.categoria}
                    onValueChange={(v) =>
                      setHabilidades(
                        habilidades.map((x, j) =>
                          j === i ? { ...x, categoria: v as CategoriaHabilidade } : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setHabilidades(habilidades.filter((_, j) => j !== i))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setHabilidades([...habilidades, { nome: "", categoria: "técnica" }])}
          >
            <Plus /> Adicionar habilidade
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
