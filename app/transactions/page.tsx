import { db } from "../_lib/prisma";
import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "../_components/ui/scroll-area";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import { getOpcoesOperacao } from "../_data/get-opcoes-operacao";
import TransactionsTable from "./_components/transactions-table";

const TransactionsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const [operacoes, userCanAddTransaction, opcoes] = await Promise.all([
    db.operacao.findMany({
      where: { usuarioId: userId },
      include: { categoria: true, tipoOperacao: true, metodoPagamento: true },
      orderBy: { data: "desc" },
    }),
    canUserAddTransaction(),
    getOpcoesOperacao(),
  ]);

  return (
    <>
      <Navbar />
      <div className="flex h-full flex-col space-y-6 overflow-hidden p-6">
        {/* TÍTULO E BOTÃO */}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Operações</h1>
          <AddTransactionButton
            userCanAddTransaction={userCanAddTransaction}
            opcoes={opcoes}
          />
        </div>
        <ScrollArea className="h-full">
          <TransactionsTable
            operacoes={JSON.parse(JSON.stringify(operacoes))}
            opcoes={opcoes}
          />
        </ScrollArea>
      </div>
    </>
  );
};

export default TransactionsPage;
