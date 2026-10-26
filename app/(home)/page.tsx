import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../_data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import AiReportButton from "./_components/ai-report-button";
import DownloadPdfButton from "./_components/download-pdf-button";
import { getOpcoesOperacao } from "../_data/get-opcoes-operacao";
import { getAnosDisponiveis } from "../_data/get-anos-disponiveis";
import { doisDigitos, lerPeriodo, periodoAtual } from "../_lib/periodo";

interface HomeProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

const Home = async ({ searchParams: { month, year } }: HomeProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  // Sem mês/ano na URL (ou inválidos): abre o mês e o ano atuais.
  const periodo = lerPeriodo(month, year);
  if (!periodo) {
    const atual = periodoAtual();
    redirect(`/?month=${doisDigitos(atual.mes)}&year=${atual.ano}`);
  }
  const [dashboard, userCanAddTransaction, opcoes, user, anos] =
    await Promise.all([
      getDashboard(periodo),
      canUserAddTransaction(),
      getOpcoesOperacao(),
      clerkClient().users.getUser(userId),
      getAnosDisponiveis(userId, periodo.ano),
    ]);

  return (
    <>
      <Navbar />
      {/* A página rola quando o conteúdo não cabe na tela (ex.: notebook): antes tudo era
          overflow-hidden e o que passava da altura ficava cortado, sem rolagem. */}
      <div className="flex h-full flex-col space-y-6 overflow-y-auto p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <DownloadPdfButton mes={periodo.mes} ano={periodo.ano} />
            <AiReportButton
              month={periodo.mes}
              year={periodo.ano}
              hasPremiumPlan={
                user.publicMetadata.subscriptionPlan === "premium"
              }
            />
            <TimeSelect mes={periodo.mes} ano={periodo.ano} anos={anos} />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-[2fr,1fr] gap-6">
          <div className="flex flex-col gap-6">
            <SummaryCards
              balance={dashboard.balance}
              investimentosTotal={dashboard.investimentosTotal}
              depositosTotal={dashboard.depositosTotal}
              despesasTotal={dashboard.despesasTotal}
              userCanAddTransaction={userCanAddTransaction}
              opcoes={opcoes}
            />
            <div className="grid flex-1 grid-cols-3 gap-6">
              <TransactionsPieChart
                percentualPorTipo={dashboard.percentualPorTipo}
                depositosTotal={dashboard.depositosTotal}
                investimentosTotal={dashboard.investimentosTotal}
                despesasTotal={dashboard.despesasTotal}
              />
              <ExpensesPerCategory
                totalPorCategoria={dashboard.totalPorCategoria}
              />
            </div>
          </div>
          <LastTransactions ultimasOperacoes={dashboard.ultimasOperacoes} />
        </div>
      </div>
    </>
  );
};

export default Home;
