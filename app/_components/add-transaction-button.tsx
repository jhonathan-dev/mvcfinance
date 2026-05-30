"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface AddTransactionButtonProps {
  userCanAddTransaction?: boolean;
}

const AddTransactionButton = ({
  userCanAddTransaction,
}: AddTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button
                className="rounded-full font-bold"
                onClick={() => setDialogIsOpen(true)}
                disabled={!userCanAddTransaction}
              >
                Adicionar transação
                <ArrowDownUpIcon />
              </Button>
            </div>
          </TooltipTrigger>
          {!userCanAddTransaction && (
            <TooltipContent>
              Você atingiu o limite de transações. Atualize seu plano para criar
              transações ilimitadas.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
      />
    </>
  );
};

export default AddTransactionButton;
