import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pontuacao, StatusPill } from "@/components/tech-tag";
import { EstadoVazio } from "@/components/estado-vazio";
import { carregarCandidaturas } from "@/lib/dados";
import { formatarData } from "@/lib/dominio";
import { FilePlus2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Painel — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Acompanhe suas candidaturas recentes, a pontuação de compatibilidade e o status de cada vaga.",
      },
      { property: "og:title", content: "Painel — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Candidaturas recentes com pontuação de compatibilidade e status.",
      },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { data: candidaturas = [], isLoading } = useQuery({
    queryKey: ["candidaturas"],
    queryFn: carregarCandidaturas,
  });

  const pontuacoes = candidaturas.map((c) => c.matches[0]?.pontuacao ?? 0);
  const media = pontuacoes.length
    ? Math.round(pontuacoes.reduce((s, v) => s + v, 0) / pontuacoes.length)
    : 0;

  return (
    <AppShell
      titulo="Painel"
      descricao="Suas candidaturas recentes, com compatibilidade calculada a partir do seu currículo-base."
      acao={
        <Button asChild>
          <Link to="/nova-vaga">
            <FilePlus2 /> Nova Vaga
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { rotulo: "Vagas analisadas", valor: String(candidaturas.length) },
          { rotulo: "Compatibilidade média", valor: String(media) },
          {
            rotulo: "Em processo",
            valor: String(
              candidaturas.filter((c) => c.status === "aplicado" || c.status === "entrevista")
                .length,
            ),
          },
        ].map((item) => (
          <Card key={item.rotulo} className="border-border">
            <CardContent className="p-5">
              <div className="label-tech">{item.rotulo}</div>
              <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{item.valor}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Candidaturas recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-5 py-10 text-center font-mono text-xs text-muted-foreground">
              carregando…
            </div>
          ) : candidaturas.length === 0 ? (
            <div className="p-5">
              <EstadoVazio
                titulo="Nenhuma vaga analisada ainda"
                descricao="Cole a descrição de uma vaga para ver o que combina com o seu currículo-base e o que falta."
                acao={
                  <Button asChild>
                    <Link to="/nova-vaga">
                      <FilePlus2 /> Adicionar a primeira vaga
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {candidaturas.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight">{c.cargo || "Sem cargo"}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {c.empresa || "—"} · {formatarData(c.created_at)} · {c.idioma.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusPill status={c.status} />
                    <Pontuacao valor={c.matches[0]?.pontuacao ?? 0} />
                    <Button asChild variant="outline" size="sm">
                      <Link to="/analise" search={{ id: c.id }}>
                        Ver análise
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
