import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pontuacao, TechTag } from "@/components/tech-tag";
import { EstadoVazio } from "@/components/estado-vazio";
import { carregarCandidatura } from "@/lib/dados";
import { FileCheck2, FilePlus2 } from "lucide-react";

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
          <Button asChild>
            <Link to="/curriculo-gerado" search={{ id: candidatura.id }}>
              <FileCheck2 /> Ver currículo gerado
            </Link>
          </Button>
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
