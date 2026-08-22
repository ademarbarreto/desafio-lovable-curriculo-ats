import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText } from "lucide-react";
import {
  analiseExemplo,
  certificacoes,
  curriculoAdaptado,
  experiencias,
  formacoes,
  habilidades,
  perfil,
} from "@/lib/mock-data";

export const Route = createFileRoute("/curriculo-gerado")({
  head: () => ({
    meta: [
      { title: "Currículo Gerado — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Preview do currículo adaptado para a vaga, com observações honestas sobre as lacunas encontradas.",
      },
      { property: "og:title", content: "Currículo Gerado — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Currículo adaptado à vaga, com lacunas declaradas e nada inventado.",
      },
    ],
  }),
  component: CurriculoGerado,
});

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="border-b border-border pb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
        {titulo}
      </h3>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function CurriculoGerado() {
  return (
    <AppShell
      titulo="Currículo Gerado"
      descricao={`Adaptado para ${analiseExemplo.cargo_vaga} · ${analiseExemplo.empresa_vaga}`}
      acao={
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <FileText /> Exportar DOCX
          </Button>
          <Button disabled>
            <Download /> Exportar PDF
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span className="label-tech">arquivo</span>
        <span className="rounded-sm border border-border bg-card px-2 py-1">
          {curriculoAdaptado.arquivo}
        </span>
      </div>

      <Card className="border-border">
        <CardContent className="mx-auto max-w-2xl px-8 py-10">
          <header>
            <h2 className="text-2xl font-extrabold leading-tight">{perfil.nome_completo}</h2>
            <p className="mt-0.5 text-sm font-semibold text-primary">
              {analiseExemplo.cargo_vaga}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {perfil.email} · {perfil.telefone} · {perfil.localizacao}
            </p>
            <p className="text-xs text-muted-foreground">
              {perfil.linkedin_url} · {perfil.github_url} · {perfil.portfolio_url}
            </p>
          </header>

          <Secao titulo="Resumo">
            <p className="text-sm leading-relaxed">{perfil.resumo}</p>
          </Secao>

          <Secao titulo="Experiência">
            {experiencias.map((e) => (
              <div key={e.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-bold">
                    {e.cargo} — {e.empresa}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {e.data_inicio} — {e.data_fim || "atual"}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">{e.descricao}</p>
              </div>
            ))}
          </Secao>

          <Secao titulo="Formação">
            {formacoes.map((f) => (
              <div key={f.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm">
                  <strong className="font-bold">{f.curso}</strong> — {f.instituicao}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {f.data_inicio} — {f.data_fim}
                </span>
              </div>
            ))}
          </Secao>

          <Secao titulo="Certificações">
            {certificacoes.map((c) => (
              <div key={c.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm">
                  <strong className="font-bold">{c.nome}</strong> — {c.emissor}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {c.data_emissao} — {c.data_validade}
                </span>
              </div>
            ))}
          </Secao>

          <Secao titulo="Habilidades">
            <p className="text-sm leading-relaxed">
              {habilidades.map((h) => h.nome).join(" · ")}
            </p>
          </Secao>
        </CardContent>
      </Card>

      <Card className="mt-6 border-warning/30 bg-warning-soft">
        <CardContent className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-warning">
            Observações
          </h3>
          <Separator className="my-3 bg-warning/20" />
          <ul className="space-y-2 text-sm">
            {curriculoAdaptado.observacoes.map((o) => (
              <li key={o} className="flex gap-2">
                <span className="font-mono text-warning">~</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Estas lacunas ficam registradas aqui e não entram no corpo do currículo. Nada foi
            adicionado ao seu histórico.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
