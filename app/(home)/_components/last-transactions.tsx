import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { formatCurrency } from "@/app/_utils/currency";
import Image from "next/image";
import Link from "next/link";
import { OperacaoComRelacoes } from "@/app/transactions/_columns";

interface LastTransactionsProps {
  ultimasOperacoes: OperacaoComRelacoes[];
}

const LastTransactions = ({ ultimasOperacoes }: LastTransactionsProps) => {
  const getAmountColor = (operacao: OperacaoComRelacoes) => {
    if (operacao.tipoOperacao.tipo === "Despesa") return "text-red-500";
    if (operacao.tipoOperacao.tipo === "Depósito") return "text-green-500";
    return "text-gray-500";
  };
  const getAmountPrefix = (operacao: OperacaoComRelacoes) =>
    operacao.tipoOperacao.tipo === "Depósito" ? "+" : "-";

  // O ScrollArea fica "solto" (absolute) dentro de um wrapper: assim a altura
  // da linha é definida pelo conteúdo da coluna da esquerda e esta lista rola
  // por dentro, em vez de esticar a página ou ser cortada.
  return (
    <div className="relative min-h-[360px]">
      <ScrollArea className="absolute inset-0 rounded-md border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-bold">Últimas Operações</CardTitle>
          <Button variant="outline" className="rounded-full font-bold" asChild>
            <Link href="/transactions">Ver mais</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {ultimasOperacoes.map((operacao) => (
            <div
              key={operacao.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary bg-opacity-[20%] p-3 text-primary">
                  {operacao.metodoPagamento.icone ? (
                    <Image
                      src={operacao.metodoPagamento.icone}
                      height={20}
                      width={20}
                      alt={operacao.metodoPagamento.nome}
                    />
                  ) : (
                    <div className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{operacao.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(operacao.data).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-bold ${getAmountColor(operacao)}`}>
                {getAmountPrefix(operacao)}
                {formatCurrency(Number(operacao.valor))}
              </p>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </div>
  );
};

export default LastTransactions;
