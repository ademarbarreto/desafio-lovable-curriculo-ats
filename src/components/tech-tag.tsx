import { cn } from "@/lib/utils";

export function TechTag({
  tipo,
  children,
  index = 0,
  animar = false,
}: {
  tipo: "match" | "gap";
  children: React.ReactNode;
  index?: number;
  animar?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-xs",
        tipo === "match"
          ? "border-success/30 bg-success-soft text-success"
          : "border-warning/35 bg-warning-soft text-warning",
        animar && "animate-scan-in",
      )}
      style={animar ? { animationDelay: `${index * 55}ms` } : undefined}
    >
      <span aria-hidden className="opacity-70">
        {tipo === "match" ? "+" : "~"}
      </span>
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    rascunho: "border-border bg-muted text-muted-foreground",
    aplicado: "border-primary/30 bg-primary/10 text-primary",
    entrevista: "border-warning/35 bg-warning-soft text-warning",
    rejeitado: "border-destructive/30 bg-destructive/10 text-destructive",
    aceito: "border-success/30 bg-success-soft text-success",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        map[status] ?? map.rascunho,
      )}
    >
      {status}
    </span>
  );
}

export function Pontuacao({ valor, tamanho = "md" }: { valor: number; tamanho?: "md" | "lg" }) {
  const cor = valor >= 75 ? "text-success" : valor >= 55 ? "text-warning" : "text-destructive";
  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums",
        cor,
        tamanho === "lg" ? "text-5xl" : "text-base",
      )}
    >
      {valor}
      <span className="text-muted-foreground/60">/100</span>
    </span>
  );
}
