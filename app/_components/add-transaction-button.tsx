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
import { OpcoesOperacao } from "../_data/get-opcoes-operacao";

interface AddTransactionButtonProps {
  userCanAddTransaction?: boolean;
  opcoes: OpcoesOperacao;
}

const AddTransactionButton = ({
  userCanAddTransaction,
  opcoes,
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
                Adicionar operação
                <ArrowDownUpIcon />
              </Button>
            </div>
          </TooltipTrigger>
          {!userCanAddTransaction && (
            <TooltipContent>
              Você atingiu o limite de operações. Atualize seu plano para criar
              operações ilimitadas.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        opcoes={opcoes}
      />
    </>
  );
};

export default AddTransactionButton;
