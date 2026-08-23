import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pontuacao } from "@/components/tech-tag";
import { EstadoVazio } from "@/components/estado-vazio";
import { carregarCandidaturas } from "@/lib/dados";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, formatarData, type StatusCandidatura } from "@/lib/dominio";
import { FilePlus2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Currículo Certeiro" },
      {
        name: "description",
        content: "Todas as vagas analisadas, com pontuação de compatibilidade e status editável.",
      },
      { property: "og:title", content: "Histórico — Currículo Certeiro" },
      {
        property: "og:description",
        content: "Acompanhe cada candidatura do rascunho ao resultado.",
      },
    ],
  }),
  component: Historico,
});

function Historico() {
  const queryClient = useQueryClient();
  const { data: linhas = [], isLoading } = useQuery({
    queryKey: ["candidaturas"],
    queryFn: carregarCandidaturas,
  });

  const alterarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusCandidatura }) => {
      const { error } = await supabase.from("job_postings").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast.success("Status atualizado.");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  return (
    <AppShell
      titulo="Histórico"
      descricao="Todas as vagas analisadas até aqui. Atualize o status conforme o processo avança."
      acao={
        <Button asChild variant="outline">
          <Link to="/nova-vaga">
            <FilePlus2 /> Nova Vaga
          </Link>
        </Button>
      }
    >
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-5 py-10 text-center font-mono text-xs text-muted-foreground">
              carregando…
            </div>
          ) : linhas.length === 0 ? (
            <div className="p-5">
              <EstadoVazio
                titulo="Nenhuma vaga analisada ainda"
                descricao="Assim que você analisar uma vaga, ela aparece aqui com pontuação e status para acompanhar o processo."
                acao={
                  <Button asChild>
                    <Link to="/nova-vaga">
                      <FilePlus2 /> Adicionar a primeira vaga
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="label-tech">Data</TableHead>
                  <TableHead className="label-tech">Empresa</TableHead>
                  <TableHead className="label-tech">Cargo</TableHead>
                  <TableHead className="label-tech">Idioma</TableHead>
                  <TableHead className="label-tech">Pontuação</TableHead>
                  <TableHead className="label-tech">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatarData(l.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{l.empresa || "—"}</TableCell>
                    <TableCell>{l.cargo || "—"}</TableCell>
                    <TableCell className="font-mono text-xs uppercase">{l.idioma}</TableCell>
                    <TableCell>
                      <Pontuacao valor={l.matches[0]?.pontuacao ?? 0} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={l.status}
                        onValueChange={(v) =>
                          alterarStatus.mutate({ id: l.id, status: v as StatusCandidatura })
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABEL).map(([valor, rotulo]) => (
                            <SelectItem key={valor} value={valor}>
                              {rotulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/analise" search={{ id: l.id }}>
                          Abrir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
