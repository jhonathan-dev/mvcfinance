"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
/* import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"; */
import { useState } from "react";
import UpsertOperationDialog from "./upsert-operation-dialog";

const AddOperationButton = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        className="rounded-full font-bold"
        onClick={() => setDialogIsOpen(true)}
      >
        Adicionar transação
        <ArrowDownUpIcon />
      </Button>
      <UpsertOperationDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
      />
    </>
  );
};

export default AddOperationButton;
