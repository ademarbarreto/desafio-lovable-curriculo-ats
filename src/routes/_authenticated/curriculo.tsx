import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Plus } from "lucide-react";
import { perfil, experiencias, formacoes, certificacoes, habilidades } from "@/lib/mock-data";

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

function Campo({
  id,
  label,
  defaultValue,
  className,
  placeholder,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="label-tech">
        {label}
      </Label>
      <Input id={id} defaultValue={defaultValue} placeholder={placeholder} className="mt-1.5" />
    </div>
  );
}

function MeuCurriculo() {
  return (
    <AppShell
      titulo="Meu Currículo"
      descricao="Esta é a única fonte de verdade. Tudo que for gerado para uma vaga sai daqui — nada é inventado."
      acao={<Button>Salvar currículo-base</Button>}
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
          <Campo id="nome" label="Nome completo" defaultValue={perfil.nome_completo} />
          <Campo id="titulo" label="Título profissional" defaultValue={perfil.titulo_profissional} />
          <Campo id="email" label="E-mail" defaultValue={perfil.email} />
          <Campo id="telefone" label="Telefone" defaultValue={perfil.telefone} />
          <Campo id="local" label="Localização" defaultValue={perfil.localizacao} />
          <Campo id="linkedin" label="LinkedIn" defaultValue={perfil.linkedin_url} />
          <Campo id="github" label="GitHub" defaultValue={perfil.github_url} />
          <Campo id="portfolio" label="Portfólio" defaultValue={perfil.portfolio_url} />
          <div className="sm:col-span-2">
            <Label htmlFor="resumo" className="label-tech">
              Resumo
            </Label>
            <Textarea id="resumo" defaultValue={perfil.resumo} rows={4} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-base">Experiências</CardTitle>
          <Button variant="outline" size="sm">
            <Plus /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          {experiencias.map((exp, i) => (
            <div key={exp.id}>
              {i > 0 ? <Separator className="mb-6" /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id={`emp-${exp.id}`} label="Empresa" defaultValue={exp.empresa} />
                <Campo id={`car-${exp.id}`} label="Cargo" defaultValue={exp.cargo} />
                <Campo id={`ini-${exp.id}`} label="Data de início" defaultValue={exp.data_inicio} />
                <Campo
                  id={`fim-${exp.id}`}
                  label="Data de fim (vazio = emprego atual)"
                  defaultValue={exp.data_fim}
                  placeholder="emprego atual"
                />
                <div className="sm:col-span-2">
                  <Label htmlFor={`desc-${exp.id}`} className="label-tech">
                    Descrição
                  </Label>
                  <Textarea
                    id={`desc-${exp.id}`}
                    defaultValue={exp.descricao}
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base">Formação</CardTitle>
            <Button variant="outline" size="sm">
              <Plus /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {formacoes.map((f) => (
              <div key={f.id} className="grid gap-4 sm:grid-cols-2">
                <Campo id={`inst-${f.id}`} label="Instituição" defaultValue={f.instituicao} />
                <Campo id={`curso-${f.id}`} label="Curso" defaultValue={f.curso} />
                <Campo id={`fini-${f.id}`} label="Início" defaultValue={f.data_inicio} />
                <Campo id={`ffim-${f.id}`} label="Fim" defaultValue={f.data_fim} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base">Certificações</CardTitle>
            <Button variant="outline" size="sm">
              <Plus /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {certificacoes.map((c) => (
              <div key={c.id} className="grid gap-4 sm:grid-cols-2">
                <Campo id={`cn-${c.id}`} label="Nome" defaultValue={c.nome} />
                <Campo id={`ce-${c.id}`} label="Emissor" defaultValue={c.emissor} />
                <Campo id={`cem-${c.id}`} label="Emissão" defaultValue={c.data_emissao} />
                <Campo id={`cv-${c.id}`} label="Validade" defaultValue={c.data_validade} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Habilidades</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {habilidades.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center gap-3">
                <Input defaultValue={h.nome} className="max-w-xs" />
                <Select defaultValue={h.categoria}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="técnica">técnica</SelectItem>
                    <SelectItem value="ferramenta">ferramenta</SelectItem>
                    <SelectItem value="soft skill">soft skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            <Plus /> Adicionar habilidade
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
