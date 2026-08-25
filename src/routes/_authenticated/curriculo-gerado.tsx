import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { EstadoVazio } from "@/components/estado-vazio";
import { carregarCandidatura, carregarCurriculo } from "@/lib/dados";
import {
  exportarDocx,
  exportarPdf,
  nomeArquivoAts,
  normalizarPeriodo,
  type CurriculoAts,
} from "@/lib/exportar-curriculo";

export const Route = createFileRoute("/_authenticated/curriculo-gerado")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : undefined,
  }),
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

function bulletsDe(descricao: string): string[] {
  return (descricao ?? "")
    .split(/\r?\n|(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])|;/)
    .map((b) => b.replace(/^[-•*\u2022\s]+/, "").trim())
    .filter(Boolean);
}


function CurriculoGerado() {
  const { id } = Route.useSearch();
  const { data: candidatura, isLoading: carregandoVaga } = useQuery({
    queryKey: ["candidatura", id ?? "ultima"],
    queryFn: () => carregarCandidatura(id),
  });
  const { data: curriculo, isLoading: carregandoCv } = useQuery({
    queryKey: ["curriculo"],
    queryFn: carregarCurriculo,
  });

  if (carregandoVaga || carregandoCv) {
    return (
      <AppShell titulo="Currículo Gerado" descricao="Carregando…">
        <p className="font-mono text-xs text-muted-foreground">carregando…</p>
      </AppShell>
    );
  }

  if (!candidatura) {
    return (
      <AppShell
        titulo="Currículo Gerado"
        descricao="Nenhuma vaga analisada para gerar um currículo adaptado."
      >
        <EstadoVazio
          titulo="Nenhuma vaga analisada ainda"
          descricao="Analise uma vaga primeiro: o currículo adaptado é montado a partir do seu currículo-base e dos requisitos daquele anúncio."
          acao={
            <Button asChild>
              <Link to="/nova-vaga">
                <FilePlus2 /> Adicionar a primeira vaga
              </Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const perfil = curriculo?.perfil;
  const match = candidatura.matches[0];
  const observacoes = match?.observacoes ?? [];
  const adaptado = (match?.curriculo_adaptado ?? {}) as {
    titulo?: string;
    resumo?: string;
    experiencias?: { cargo: string; empresa: string; periodo: string; bullets: string[] }[];
    formacao?: string[];
    certificacoes?: string[];
    habilidades?: string[];
  };
  const temAdaptado = Array.isArray(adaptado.experiencias) && adaptado.experiencias.length > 0;
  const contato = [perfil?.email, perfil?.telefone, perfil?.localizacao].filter(Boolean).join(" · ");
  const links = [perfil?.linkedin_url, perfil?.github_url, perfil?.portfolio_url]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppShell
      titulo="Currículo Gerado"
      descricao={`Adaptado para ${candidatura.cargo || "vaga sem cargo"} · ${candidatura.empresa || "empresa não informada"}`}
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
          {nomeArquivo(perfil?.nome_completo ?? "", candidatura.empresa)}
        </span>
      </div>

      <Card className="border-border">
        <CardContent className="mx-auto max-w-2xl px-8 py-10">
          <header>
            <h2 className="text-2xl font-extrabold leading-tight">
              {perfil?.nome_completo || "Seu nome"}
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-primary">
              {adaptado.titulo || candidatura.cargo || perfil?.titulo_profissional}
            </p>
            {contato ? <p className="mt-2 text-xs text-muted-foreground">{contato}</p> : null}
            {links ? <p className="text-xs text-muted-foreground">{links}</p> : null}
          </header>

          {temAdaptado ? (
            <>
              {adaptado.resumo ? (
                <Secao titulo="Resumo">
                  <p className="text-sm leading-relaxed">{adaptado.resumo}</p>
                </Secao>
              ) : null}

              <Secao titulo="Experiência">
                {adaptado.experiencias!.map((e) => (
                  <div key={`${e.empresa}-${e.cargo}-${e.periodo}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold">
                        {e.cargo} — {e.empresa}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {e.periodo}
                      </span>
                    </div>
                    <ul className="mt-1 space-y-1">
                      {(e.bullets ?? []).map((b) => (
                        <li key={b} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                          <span className="text-muted-foreground">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Secao>

              {adaptado.formacao?.length ? (
                <Secao titulo="Formação">
                  {adaptado.formacao.map((f) => (
                    <p key={f} className="text-sm">
                      {f}
                    </p>
                  ))}
                </Secao>
              ) : null}

              {adaptado.certificacoes?.length ? (
                <Secao titulo="Certificações">
                  {adaptado.certificacoes.map((c) => (
                    <p key={c} className="text-sm">
                      {c}
                    </p>
                  ))}
                </Secao>
              ) : null}

              {adaptado.habilidades?.length ? (
                <Secao titulo="Habilidades">
                  <p className="text-sm leading-relaxed">{adaptado.habilidades.join(" · ")}</p>
                </Secao>
              ) : null}
            </>
          ) : (
            <>
          {perfil?.resumo ? (
            <Secao titulo="Resumo">
              <p className="text-sm leading-relaxed">{perfil.resumo}</p>
            </Secao>
          ) : null}

          {curriculo?.experiencias.length ? (
            <Secao titulo="Experiência">
              {curriculo.experiencias.map((e) => (
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
          ) : null}

          {curriculo?.formacoes.length ? (
            <Secao titulo="Formação">
              {curriculo.formacoes.map((f) => (
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
          ) : null}

          {curriculo?.certificacoes.length ? (
            <Secao titulo="Certificações">
              {curriculo.certificacoes.map((c) => (
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
          ) : null}

          {curriculo?.habilidades.length ? (
            <Secao titulo="Habilidades">
              <p className="text-sm leading-relaxed">
                {curriculo.habilidades.map((h) => h.nome).join(" · ")}
              </p>
            </Secao>
          ) : null}

            </>
          )}

          {!curriculo?.experiencias.length && !curriculo?.habilidades.length ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Seu currículo-base ainda está vazio.{" "}
              <Link to="/curriculo" className="text-primary underline">
                Preencha-o
              </Link>{" "}
              para gerar a versão adaptada — nada é criado automaticamente.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-6 border-warning/30 bg-warning-soft">
        <CardContent className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-warning">
            Observações
          </h3>
          <Separator className="my-3 bg-warning/20" />
          {observacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma lacuna registrada para esta vaga.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {observacoes.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="font-mono text-warning">~</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Estas lacunas ficam registradas aqui e não entram no corpo do currículo. Nada foi
            adicionado ao seu histórico.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
