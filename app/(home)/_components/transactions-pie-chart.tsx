"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { PercentualPorTipo } from "@/app/_data/get-dashboard/types";
import PercentageItem from "./percentage-item";

const chartConfig = {
  Investimento: { label: "Investido", color: "#FFFFFF" },
  Depósito: { label: "Receita", color: "#55B02E" },
  Despesa: { label: "Despesas", color: "#E93030" },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  percentualPorTipo: PercentualPorTipo[];
  depositosTotal: number;
  investimentosTotal: number;
  despesasTotal: number;
}

const TransactionsPieChart = ({
  depositosTotal,
  investimentosTotal,
  despesasTotal,
  percentualPorTipo,
}: TransactionsPieChartProps) => {
  const chartData = [
    { tipo: "Depósito", amount: depositosTotal, fill: "#55B02E" },
    { tipo: "Despesa", amount: despesasTotal, fill: "#E93030" },
    { tipo: "Investimento", amount: investimentosTotal, fill: "#D9D9D9" },
  ];

  const percentualDe = (tipo: string) =>
    percentualPorTipo.find((p) => p.tipo === tipo)?.percentual ?? 0;

  return (
    <Card className="flex flex-col p-6">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="tipo"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>

        <div className="space-y-3">
          <PercentageItem
            icon={<TrendingUpIcon size={16} className="text-green-500" />}
            title="Receita"
            value={percentualDe("Depósito")}
          />
          <PercentageItem
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            value={percentualDe("Despesa")}
          />
          <PercentageItem
            icon={<PiggyBankIcon size={16} />}
            title="Investido"
            value={percentualDe("Investimento")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsPieChart;
