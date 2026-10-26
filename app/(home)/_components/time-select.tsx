"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { doisDigitos, NOMES_DOS_MESES } from "@/app/_lib/periodo";
import { useRouter } from "next/navigation";

interface TimeSelectProps {
  mes: number; // 1-12
  ano: number;
  anos: number[];
}

const TimeSelect = ({ mes, ano, anos }: TimeSelectProps) => {
  const { push } = useRouter();

  const irPara = (novoMes: number, novoAno: number) => {
    push(`/?month=${doisDigitos(novoMes)}&year=${novoAno}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(mes)}
        onValueChange={(valor) => irPara(Number(valor), ano)}
      >
        <SelectTrigger className="w-[150px] rounded-full">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {NOMES_DOS_MESES.map((nome, indice) => (
            <SelectItem key={nome} value={String(indice + 1)}>
              {nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(ano)}
        onValueChange={(valor) => irPara(mes, Number(valor))}
      >
        <SelectTrigger className="w-[110px] rounded-full">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {anos.map((opcao) => (
            <SelectItem key={opcao} value={String(opcao)}>
              {opcao}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelect;
