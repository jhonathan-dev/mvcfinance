import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCard from "./summary-card";
import { OpcoesOperacao } from "@/app/_data/get-opcoes-operacao";

interface SummaryCardsProps {
  month: string;
  balance: number;
  investimentosTotal: number;
  depositosTotal: number;
  despesasTotal: number;
  userCanAddTransaction?: boolean;
  opcoes: OpcoesOperacao;
}

const SummaryCards = ({
  balance,
  investimentosTotal,
  depositosTotal,
  despesasTotal,
  userCanAddTransaction,
  opcoes,
}: SummaryCardsProps) => {
  return (
    <div className="space-y-6">
      {/* PRIMEIRO CARD */}

      <SummaryCard
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={balance}
        size="large"
        userCanAddTransaction={userCanAddTransaction}
        opcoes={opcoes}
      />

      {/* OUTROS CARDS */}

      <div className="grid grid-cols-3 gap-6">
        <SummaryCard
          icon={<PiggyBankIcon size={16} />}
          title="Investido"
          amount={investimentosTotal}
        />
        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-green-500" />}
          title="Receita"
          amount={depositosTotal}
        />
        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesas"
          amount={despesasTotal}
        />
      </div>
    </div>
  );
};

export default SummaryCards;
