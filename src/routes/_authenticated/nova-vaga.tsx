import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScanLine } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/nova-vaga")({
  head: () => ({
    meta: [
      { title: "Nova Vaga — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Cole a descrição da vaga e receba uma análise de compatibilidade com o seu currículo-base.",
      },
      { property: "og:title", content: "Nova Vaga — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Cole o texto da vaga e analise a compatibilidade.",
      },
    ],
  }),
  component: NovaVaga,
});

function NovaVaga() {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");

  return (
    <AppShell
      titulo="Nova Vaga"
      descricao="Cole o texto integral do anúncio. Quanto mais completo, mais precisa fica a leitura de requisitos."
    >
      <form
        className="grid gap-6 lg:grid-cols-[1fr_280px]"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/analise" });
        }}
      >
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Descrição da vaga</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <Textarea
              id="descricao-vaga"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={22}
              placeholder="Cole aqui a descrição completa da vaga: responsabilidades, requisitos obrigatórios, diferenciais…"
              className="font-mono text-[13px] leading-relaxed"
            />
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>texto colado pelo usuário</span>
              <span>{texto.length} caracteres</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div>
                <Label htmlFor="empresa" className="label-tech">
                  Empresa
                </Label>
                <Input id="empresa" placeholder="Ex.: Nubank" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="cargo" className="label-tech">
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  placeholder="Ex.: Engenheiro de Software Back-end"
                  className="mt-1.5"
                />
              </div>
              <div>
                <span className="label-tech">Idioma da vaga</span>
                <RadioGroup defaultValue="pt" className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="pt" id="idioma-pt" />
                    <Label htmlFor="idioma-pt" className="font-normal">
                      Português
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="en" id="idioma-en" />
                    <Label htmlFor="idioma-en" className="font-normal">
                      Inglês
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            <ScanLine /> Analisar Compatibilidade
          </Button>
          <p className="text-xs text-muted-foreground">
            A análise compara os requisitos da vaga com o seu currículo-base. Nada que não esteja lá
            entra no resultado.
          </p>
        </div>
      </form>
    </AppShell>
  );
}
