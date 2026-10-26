"use client";

import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";

const mesAtualLocal = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
};

const DownloadReportButton = () => {
  const [mes, setMes] = useState("");
  const [maximo, setMaximo] = useState("");

  // Calculado no navegador para usar o mês do fuso da própria pessoa.
  useEffect(() => {
    const atual = mesAtualLocal();
    setMes(atual);
    setMaximo(atual);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full font-bold">
          Baixar relatório
          <DownloadIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4" align="end">
        <div className="space-y-2">
          <Label htmlFor="mes-relatorio">Mês do relatório</Label>
          <Input
            id="mes-relatorio"
            type="month"
            value={mes}
            max={maximo || undefined}
            onChange={(e) => setMes(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            O relatório traz as operações do mês e o resumo de depósitos,
            despesas, investimentos e saldo.
          </p>
        </div>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <a
              href={
                mes
                  ? `/transactions/relatorio?mes=${mes}&formato=pdf`
                  : undefined
              }
              aria-disabled={!mes}
            >
              Baixar PDF
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a
              href={
                mes
                  ? `/transactions/relatorio?mes=${mes}&formato=csv`
                  : undefined
              }
              aria-disabled={!mes}
            >
              Baixar planilha (CSV)
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DownloadReportButton;
