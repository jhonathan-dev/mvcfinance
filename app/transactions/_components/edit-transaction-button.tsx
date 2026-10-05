"use client";

import { Button } from "@/app/_components/ui/button";
import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { OpcoesOperacao } from "@/app/_data/get-opcoes-operacao";
import { UpsertOperacaoSchema } from "@/app/_actions/add-transaction/schema";

interface EditTransactionButtonProps {
  defaultValues: UpsertOperacaoSchema;
  opcoes: OpcoesOperacao;
}

const EditTransactionButton = ({
  defaultValues,
  opcoes,
}: EditTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        defaultValues={defaultValues}
        opcoes={opcoes}
      />
    </>
  );
};

export default EditTransactionButton;
