import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FileText, LayoutDashboard, FilePlus2, ScanLine, FileCheck2, History } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/curriculo", label: "Meu Currículo", icon: FileText },
  { to: "/nova-vaga", label: "Nova Vaga", icon: FilePlus2 },
  { to: "/analise", label: "Análise de Compatibilidade", icon: ScanLine },
  { to: "/curriculo-gerado", label: "Currículo Gerado", icon: FileCheck2 },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

export function AppShell({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-5 py-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            ATS · v0.1
          </div>
          <div className="mt-1 text-[15px] font-extrabold leading-tight text-sidebar-foreground">
            Currículo Certeiro
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{
                className: cn(
                  "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary",
                ),
              }}
            >
              <item.icon className="size-4" />
              <span className="leading-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4">
          <div className="text-sm font-semibold">Ademar Barreto</div>
          <div className="font-mono text-[11px] text-muted-foreground">sessão de demonstração</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card px-6 py-5">
          <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">{titulo}</h1>
              {descricao ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{descricao}</p>
              ) : null}
            </div>
            {acao}
          </div>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
