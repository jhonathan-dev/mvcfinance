import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import { getOpcoesOperacao } from "../_data/get-opcoes-operacao";
import {
  getTransacoes,
  lerFiltros,
  SearchParamsTransacoes,
  TRANSACOES_POR_PAGINA,
} from "../_data/get-transacoes";
import DownloadReportButton from "./_components/download-report-button";
import TransactionsFilters from "./_components/transactions-filters";
import TransactionsPagination from "./_components/transactions-pagination";
import TransactionsTable from "./_components/transactions-table";

interface TransactionsPageProps {
  searchParams: SearchParamsTransacoes;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const filtros = lerFiltros(searchParams);

  const [
    { operacoes, total, pagina, totalPaginas },
    userCanAddTransaction,
    opcoes,
  ] = await Promise.all([
    getTransacoes(userId, filtros),
    canUserAddTransaction(),
    getOpcoesOperacao(),
  ]);

  return (
    <>
      <Navbar />
      <div className="flex h-full flex-col space-y-6 overflow-y-auto p-6">
        {/* TÍTULO E BOTÕES */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Operações</h1>
          <div className="flex items-center gap-3">
            <DownloadReportButton />
            <AddTransactionButton
              userCanAddTransaction={userCanAddTransaction}
              opcoes={opcoes}
            />
          </div>
        </div>

        {/* O `key` recria o formulário quando a URL muda (ex.: "Limpar"). */}
        <TransactionsFilters
          key={JSON.stringify({ ...filtros, pagina: 0 })}
          opcoes={opcoes}
          iniciais={{
            tipo: filtros.tipoId ?? "",
            categoria: filtros.categoriaId ?? "",
            metodo: filtros.metodoId ?? "",
            de: filtros.de ?? "",
            ate: filtros.ate ?? "",
            valorMin: filtros.valorMin?.toString() ?? "",
            valorMax: filtros.valorMax?.toString() ?? "",
          }}
        />

        <TransactionsTable
          operacoes={JSON.parse(JSON.stringify(operacoes))}
          opcoes={opcoes}
        />

        <TransactionsPagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          total={total}
          porPagina={TRANSACOES_POR_PAGINA}
        />
      </div>
    </>
  );
};

export default TransactionsPage;
