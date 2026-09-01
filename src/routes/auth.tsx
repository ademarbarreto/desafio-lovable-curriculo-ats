import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Currículo Certeiro" },
      {
        name: "description",
        content:
          "Acesse sua conta do Currículo Certeiro para manter seu currículo-base e analisar vagas.",
      },
      { property: "og:title", content: "Entrar — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Entre ou crie sua conta para gerar currículos adaptados a cada vaga.",
      },
    ],
  }),
  component: Autenticacao,
});

function Autenticacao() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  function mensagemErro(erro: unknown) {
    const bruto = erro instanceof Error ? erro.message : "";
    if (/invalid login credentials/i.test(bruto))
      return "E-mail ou senha incorretos. Se ainda não tem conta, use “Criar conta”.";
    if (/email not confirmed/i.test(bruto))
      return "Confirme o e-mail pelo link enviado antes de entrar.";
    if (/user already registered/i.test(bruto))
      return "Já existe uma conta com este e-mail. Use “Entrar” ou redefina a senha.";
    if (/password/i.test(bruto) && /least|curta|short/i.test(bruto))
      return "A senha precisa ter pelo menos 6 caracteres.";
    return bruto || "Não foi possível continuar.";
  }

  async function recuperarSenha() {
    if (!email) {
      toast.error("Informe o e-mail para receber o link de redefinição.");
      return;
    }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de redefinição para o seu e-mail.");
    } catch (erro) {
      toast.error(mensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nome_completo: nome },
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate({ to: "/", replace: true });
        } else {
          toast.success("Conta criada. Confirme o e-mail para entrar.");
          setModo("entrar");
        }
      }
    } catch (erro) {
      toast.error(mensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            ATS · v0.1
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Currículo Certeiro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu currículo-base fica guardado na sua conta. Nada é compartilhado com outras pessoas.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="mb-5 flex gap-1 rounded-sm border border-border bg-muted p-1 font-mono text-xs">
              {(["entrar", "criar"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModo(m)}
                  className={`flex-1 rounded-sm px-3 py-1.5 uppercase tracking-wider transition-colors ${
                    modo === m ? "bg-card text-primary" : "text-muted-foreground"
                  }`}
                >
                  {m === "entrar" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <form onSubmit={enviar} className="space-y-4">
              {modo === "criar" ? (
                <div>
                  <Label htmlFor="nome" className="label-tech">
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>
              ) : null}
              <div>
                <Label htmlFor="email" className="label-tech">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="senha" className="label-tech">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                  minLength={6}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={carregando}>
                <ScanLine /> {modo === "entrar" ? "Entrar" : "Criar conta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
