import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pontuacao, TechTag } from "@/components/tech-tag";
import { analiseExemplo } from "@/lib/mock-data";
import { FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analise")({
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
  const a = analiseExemplo;

  return (
    <AppShell
      titulo="Análise de Compatibilidade"
      descricao={`${a.cargo_vaga} · ${a.empresa_vaga} — dados de exemplo para validação de layout.`}
      acao={
        <Button asChild>
          <Link to="/curriculo-gerado">
            <FileCheck2 /> Ver currículo gerado
          </Link>
        </Button>
      }
    >
      <Card className="border-border">
        <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div>
            <div className="label-tech">Pontuação de match</div>
            <div className="mt-1">
              <Pontuacao valor={a.pontuacao} tamanho="lg" />
            </div>
          </div>
          <div className="min-w-[240px] flex-1">
            <Progress value={a.pontuacao} className="h-2" />
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>{a.habilidades_compativeis.length} requisitos atendidos</span>
              <span>{a.lacunas_reais.length} lacunas reais</span>
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
            {a.habilidades_compativeis.map((h, i) => (
              <TechTag key={h} tipo="match" index={i} animar>
                {h}
              </TechTag>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="font-mono text-warning">~</span> Lacunas reais
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-5">
            {a.lacunas_reais.map((h, i) => (
              <TechTag key={h} tipo="gap" index={a.habilidades_compativeis.length + i} animar>
                {h}
              </TechTag>
            ))}
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
    </AppShell>
  );
}
