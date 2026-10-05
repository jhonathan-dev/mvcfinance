import { Badge } from "@/app/_components/ui/badge";
import { CircleIcon } from "lucide-react";

interface OperacaoTipoBadgeProps {
  tipo: string; // "Depósito" | "Despesa" | "Investimento" (vem do banco agora)
}

const OperacaoTipoBadge = ({ tipo }: OperacaoTipoBadgeProps) => {
  if (tipo === "Depósito") {
    return (
      <Badge className="bg-green-500 bg-opacity-10 font-bold text-green-500 hover:bg-muted">
        <CircleIcon className="mr-2 fill-green-500" size={10} />
        Depósito
      </Badge>
    );
  }
  if (tipo === "Despesa") {
    return (
      <Badge className="bg-red-500 bg-opacity-10 font-bold text-red-500 hover:bg-muted">
        <CircleIcon className="mr-2 fill-red-500" size={10} />
        Despesa
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-500 bg-opacity-10 font-bold text-gray-500 hover:bg-muted">
      <CircleIcon className="mr-2 fill-gray-500" size={10} />
      {tipo}
    </Badge>
  );
};

export default OperacaoTipoBadge;
