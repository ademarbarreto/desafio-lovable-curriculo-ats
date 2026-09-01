import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Currículo Certeiro" },
      {
        name: "description",
        content: "Defina uma nova senha para acessar sua conta do Currículo Certeiro.",
      },
      { property: "og:title", content: "Redefinir senha — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Crie uma nova senha e volte a analisar vagas com seu currículo-base.",
      },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [temSessao, setTemSessao] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setTemSessao(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setTemSessao(Boolean(sessao));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada. Bem-vindo de volta.");
      navigate({ to: "/", replace: true });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível redefinir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            ATS · Recuperação
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Abra esta página pelo link enviado ao seu e-mail e escolha uma nova senha.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-5">
            {temSessao ? (
              <form onSubmit={enviar} className="space-y-4">
                <div>
                  <Label htmlFor="nova-senha" className="label-tech">
                    Nova senha
                  </Label>
                  <Input
                    id="nova-senha"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={carregando}>
                  <KeyRound /> Salvar nova senha
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Link inválido ou expirado. Peça um novo link em “Esqueci minha senha”.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate({ to: "/auth" })}
                >
                  Voltar para entrar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
