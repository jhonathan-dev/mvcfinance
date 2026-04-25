"use client";

import UpsertOperationDialog from "@/app/_components/upsert-operation-dialog";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "react-day-picker";

interface EditOperationButtonProps {
  operation: Transacation;
}

const EditOperationButton = ({ operation }: EditOperationButtonProps) => {
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
      <UpsertOperationDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        defaultValues={{ ...operation, amount: Number(operation.amount) }}
      />
    </>
  );
};

export default EditOperationButton;
