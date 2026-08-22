import type { ReactNode } from "react";
import { ScanLine } from "lucide-react";

export function EstadoVazio({
  titulo,
  descricao,
  acao,
  icone,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
  icone?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-sm border border-border bg-muted text-muted-foreground">
        {icone ?? <ScanLine className="size-5" />}
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight">{titulo}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{descricao}</p>
      {acao ? <div className="mt-5">{acao}</div> : null}
    </div>
  );
}
