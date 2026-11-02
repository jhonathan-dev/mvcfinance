"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import { ReactNode } from "react";

interface ConfirmAcaoProps {
  children: ReactNode;
  titulo: string;
  descricao: string;
  confirmar: string;
  perigosa?: boolean;
  onConfirm: () => void;
}

// Confirmação genérica para ações que não são "excluir" (promover a admin,
// banir, revogar convite...). Para exclusões, use o ConfirmDelete.
const ConfirmAcao = ({
  children,
  titulo,
  descricao,
  confirmar,
  perigosa = false,
  onConfirm,
}: ConfirmAcaoProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{titulo}</AlertDialogTitle>
        <AlertDialogDescription>{descricao}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className={
            perigosa
              ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
              : undefined
          }
        >
          {confirmar}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmAcao;
