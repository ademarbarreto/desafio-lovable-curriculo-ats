import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { analisarComIA } from "@/lib/analise-ia.functions";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pontuacao, TechTag } from "@/components/tech-tag";
import { EstadoVazio } from "@/components/estado-vazio";
import { carregarCandidatura } from "@/lib/dados";
import { FileCheck2, FilePlus2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analise")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Análise de Compatibilidade — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Pontuação, habilidades compatíveis e lacunas reais entre o seu currículo-base e a vaga analisada.",
      },
      { property: "og:title", content: "Análise de Compatibilidade — Currículo Certeiro" },
      {
        property: "og:description",
        content: "O que combina e o que falta, lado a lado, sem maquiagem.",
      },
    ],
  }),
  component: Analise,
});

function Analise() {
  const { id } = Route.useSearch();
  const { data: candidatura, isLoading } = useQuery({
    queryKey: ["candidatura", id ?? "ultima"],
    queryFn: () => carregarCandidatura(id),
  });

  const match = candidatura?.matches[0];
  const queryClient = useQueryClient();
  const executarAnalise = useServerFn(analisarComIA);
  const [reanalisando, setReanalisando] = useState(false);

  const evidencias = (match?.evidencias ?? []) as { requisito: string; evidencia: string }[];
  const lacunasDetalhadas = (match?.lacunas_detalhadas ?? []) as {
    requisito: string;
    situacao: string;
    explicacao: string;
  }[];

  async function reanalisar() {
    if (!candidatura) return;
    setReanalisando(true);
    try {
      await executarAnalise({ data: { job_posting_id: candidatura.id } });
      await queryClient.invalidateQueries();
      toast.success("Análise refeita pela IA.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível reanalisar.");
    } finally {
      setReanalisando(false);
    }
  }

  return (
    <AppShell
      titulo="Análise de Compatibilidade"
      descricao={
        candidatura
          ? `${candidatura.cargo || "Sem cargo"} · ${candidatura.empresa || "—"}`
          : "Comparação entre o seu currículo-base e a vaga escolhida."
      }
      acao={
        candidatura ? (
          <div className="flex gap-2">
          <Button variant="outline" onClick={reanalisar} disabled={reanalisando}>
            <Sparkles /> {reanalisando ? "Analisando…" : "Reanalisar com IA"}
          </Button>
          <Button asChild>
            <Link to="/curriculo-gerado" search={{ id: candidatura.id }}>
              <FileCheck2 /> Ver currículo gerado
            </Link>
          </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="py-10 text-center font-mono text-xs text-muted-foreground">carregando…</div>
      ) : !candidatura || !match ? (
        <EstadoVazio
          titulo="Nenhuma vaga analisada ainda"
          descricao="Adicione a primeira vaga para ver a pontuação, as habilidades compatíveis e as lacunas reais."
          acao={
            <Button asChild>
              <Link to="/nova-vaga">
                <FilePlus2 /> Adicionar a primeira vaga
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <Card className="border-border">
            <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
              <div>
                <div className="label-tech">Pontuação de match</div>
                <div className="mt-1">
                  <Pontuacao valor={match.pontuacao} tamanho="lg" />
                </div>
              </div>
              <div className="min-w-[240px] flex-1">
                <Progress value={match.pontuacao} className="h-2" />
                <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{match.habilidades_compativeis.length} requisitos atendidos</span>
                  <span>{match.lacunas_reais.length} lacunas reais</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="font-mono text-success">+</span> Compatível
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-5">
                {match.habilidades_compativeis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma habilidade do seu currículo-base foi citada nesta vaga.
                  </p>
                ) : (
                  match.habilidades_compativeis.map((h, i) => (
                    <TechTag key={h} tipo="match" index={i} animar>
                      {h}
                    </TechTag>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="font-mono text-warning">~</span> Lacunas reais
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-5">
                {match.lacunas_reais.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma lacuna identificada no texto desta vaga.
                  </p>
                ) : (
                  match.lacunas_reais.map((h, i) => (
                    <TechTag
                      key={h}
                      tipo="gap"
                      index={match.habilidades_compativeis.length + i}
                      animar
                    >
                      {h}
                    </TechTag>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {evidencias.length > 0 ? (
            <Card className="mt-6 border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-base">Evidências no currículo-base</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {evidencias.map((e) => (
                    <li key={e.requisito} className="grid gap-1 sm:grid-cols-[220px_1fr] sm:gap-4">
                      <span className="font-mono text-xs text-success">+ {e.requisito}</span>
                      <span className="text-sm text-foreground/90">{e.evidencia}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {lacunasDetalhadas.length > 0 ? (
            <Card className="mt-6 border-warning/30 bg-warning-soft">
              <CardHeader className="border-b border-warning/20">
                <CardTitle className="text-base">Por que cada lacuna existe</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {lacunasDetalhadas.map((l) => (
                    <li key={l.requisito} className="grid gap-1 sm:grid-cols-[220px_1fr] sm:gap-4">
                      <span className="font-mono text-xs text-warning">
                        ~ {l.requisito}
                        <span className="ml-1 opacity-70">
                          {l.situacao === "atende_parcialmente" ? "(parcial)" : "(não atende)"}
                        </span>
                      </span>
                      <span className="text-sm text-foreground/90">{l.explicacao}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card className="mt-6 border-border">
            <CardContent className="p-5 text-sm text-muted-foreground">
              As lacunas ficam visíveis de propósito. O currículo gerado não adiciona nenhuma
              habilidade, ferramenta, certificação ou tempo de experiência que não esteja no seu
              currículo-base.
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
