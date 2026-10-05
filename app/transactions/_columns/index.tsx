"use client";

import { Prisma } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import OperacaoTipoBadge from "../_components/type-badge";
import EditTransactionButton from "../_components/edit-transaction-button";
import DeleteTransactionButton from "../_components/delete-trasaction-button";
import { OpcoesOperacao } from "@/app/_data/get-opcoes-operacao";

export type OperacaoComRelacoes = Prisma.OperacaoGetPayload<{
  include: { categoria: true; tipoOperacao: true; metodoPagamento: true };
}>;

export const getTransactionsColumns = (
  opcoes: OpcoesOperacao,
): ColumnDef<OperacaoComRelacoes>[] => [
  {
    accessorKey: "titulo",
    header: "Nome",
  },
  {
    accessorKey: "tipoOperacao",
    header: "Tipo",
    cell: ({ row: { original: operacao } }) => (
      <OperacaoTipoBadge tipo={operacao.tipoOperacao.tipo} />
    ),
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row: { original: operacao } }) => operacao.categoria.nome,
  },
  {
    accessorKey: "metodoPagamento",
    header: "Método de Pagamento",
    cell: ({ row: { original: operacao } }) => operacao.metodoPagamento.nome,
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row: { original: operacao } }) =>
      new Date(operacao.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row: { original: operacao } }) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(operacao.valor)),
  },
  {
    accessorKey: "Actions",
    header: "",
    cell: ({ row: { original: operacao } }) => {
      return (
        <div className="space-x-1">
          <EditTransactionButton
            opcoes={opcoes}
            defaultValues={{
              id: operacao.id,
              titulo: operacao.titulo,
              valor: Number(operacao.valor),
              tipoOperacaoId: operacao.tipoOperacaoId,
              categoriaId: operacao.categoriaId,
              metodoPagamentoId: operacao.metodoPagamentoId,
              data: new Date(operacao.data),
            }}
          />
          <DeleteTransactionButton operacaoId={operacao.id} />
        </div>
      );
    },
  },
];
