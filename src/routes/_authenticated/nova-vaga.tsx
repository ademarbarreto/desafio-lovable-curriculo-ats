import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScanLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usuarioAtual } from "@/lib/dados";
import { analisarVaga } from "@/lib/analise";
import type { Idioma } from "@/lib/dominio";

export const Route = createFileRoute("/_authenticated/nova-vaga")({
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
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [idioma, setIdioma] = useState<Idioma>("pt");
  const [salvando, setSalvando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 20) {
      toast.error("Cole a descrição da vaga para analisar.");
      return;
    }
    setSalvando(true);
    try {
      const user = await usuarioAtual();

      const { data: habilidades, error: erroHab } = await supabase.from("skills").select("nome");
      if (erroHab) throw new Error(erroHab.message);

      const { data: vaga, error: erroVaga } = await supabase
        .from("job_postings")
        .insert({ user_id: user.id, empresa, cargo, descricao: texto, idioma })
        .select("id")
        .single();
      if (erroVaga) throw new Error(erroVaga.message);

      const resultado = analisarVaga(texto, habilidades ?? [], idioma);
      const { error: erroMatch } = await supabase.from("matches").insert({
        user_id: user.id,
        job_posting_id: vaga.id,
        ...resultado,
      });
      if (erroMatch) throw new Error(erroMatch.message);

      await queryClient.invalidateQueries();
      navigate({ to: "/analise", search: { id: vaga.id } });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível analisar a vaga.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell
      titulo="Nova Vaga"
      descricao="Cole o texto integral do anúncio. Quanto mais completo, mais precisa fica a leitura de requisitos."
    >
      <form className="grid gap-6 lg:grid-cols-[1fr_280px]" onSubmit={enviar}>
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
                <Input
                  id="empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ex.: Nubank"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cargo" className="label-tech">
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex.: Engenheiro de Software Back-end"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="label-tech">Idioma do currículo</Label>
                <RadioGroup
                  value={idioma}
                  onValueChange={(v) => setIdioma(v as Idioma)}
                  className="mt-2"
                >
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

          <Button type="submit" className="w-full" disabled={salvando}>
            <ScanLine /> {salvando ? "Analisando…" : "Analisar Compatibilidade"}
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
