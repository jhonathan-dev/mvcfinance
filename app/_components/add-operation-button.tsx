"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import UpsertOperationDialog from "./upsert-operation-dialog";

interface OperationOption {
  id: string;
  label: string;
}

interface AddOperationButtonProps {
  types: OperationOption[];
  categories: OperationOption[];
  paymentMethods: OperationOption[];
}

const AddOperationButton = ({
  types,
  categories,
  paymentMethods,
}: AddOperationButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        className="rounded-full font-bold"
        onClick={() => setDialogIsOpen(true)}
      >
        Adicionar operação
        <ArrowDownUpIcon />
      </Button>
      <UpsertOperationDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        types={types}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </>
  );
};

export default AddOperationButton;
