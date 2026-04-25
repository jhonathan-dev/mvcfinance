"use client";

import { Operation } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import OperationTypeBadge from "../_components/type-badge";
import { Button } from "@/app/_components/ui/button";
import { TrashIcon } from "lucide-react";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/operations";
import EditOperationButton from "../_components/edit-operation-button";

export const operationsColumns: ColumnDef<Operation>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row: { original: operation } }) => (
      <OperationTypeBadge operation={operation} />
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row: { original: operation } }) =>
      TRANSACTION_CATEGORY_LABELS[operation.category],
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pagamento",
    cell: ({ row: { original: operation } }) =>
      TRANSACTION_PAYMENT_METHOD_LABELS[operation.paymentMethod],
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row: { original: operation } }) =>
      new Date(operation.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row: { original: operation } }) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(operation.amount)),
  },
  {
    accessorKey: "Actions",
    header: "",
    cell: ({ row: { original: operation } }) => {
      return (
        <div className="space-x-1">
          <EditOperationButton operation={operation} />
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <TrashIcon />
          </Button>
        </div>
      );
    },
  },
];
