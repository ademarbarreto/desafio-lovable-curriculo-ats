import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pontuacao } from "@/components/tech-tag";
import { candidaturas as iniciais, STATUS_LABEL, type StatusCandidatura } from "@/lib/mock-data";
import { FilePlus2 } from "lucide-react";

export const Route = createFileRoute("/historico")({
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
  const [linhas, setLinhas] = useState(iniciais);

  const alterarStatus = (id: string, status: StatusCandidatura) =>
    setLinhas((atual) => atual.map((l) => (l.id === id ? { ...l, status } : l)));

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
                    {l.data}
                  </TableCell>
                  <TableCell className="font-medium">{l.empresa_vaga}</TableCell>
                  <TableCell>{l.cargo_vaga}</TableCell>
                  <TableCell className="font-mono text-xs uppercase">{l.idioma}</TableCell>
                  <TableCell>
                    <Pontuacao valor={l.pontuacao} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={l.status}
                      onValueChange={(v) => alterarStatus(l.id, v as StatusCandidatura)}
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
                      <Link to="/analise">Abrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
