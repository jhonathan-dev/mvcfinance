"use client";

import { DataTable } from "@/app/_components/ui/data-tabble";
import { getTransactionsColumns, OperacaoComRelacoes } from "../_columns";
import { OpcoesOperacao } from "@/app/_data/get-opcoes-operacao";

interface TransactionsTableProps {
  operacoes: OperacaoComRelacoes[];
  opcoes: OpcoesOperacao;
}

const TransactionsTable = ({ operacoes, opcoes }: TransactionsTableProps) => {
  return (
    <DataTable columns={getTransactionsColumns(opcoes)} data={operacoes} />
  );
};

export default TransactionsTable;
