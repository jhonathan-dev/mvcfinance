import { Badge } from "@/app/_components/ui/badge";
import { Operation, OperationType } from "@prisma/client";
import { CircleIcon } from "lucide-react";

interface OperationTypeBadgeProps {
  operation: Operation;
}

const operationTypeBadge = ({ operation }: OperationTypeBadgeProps) => {
  if (operation.type === OperationType.DEPOSIT) {
    return (
      <Badge className="bg-green-500 bg-opacity-10 font-bold text-green-500 hover:bg-muted">
        <CircleIcon className="mr-2 fill-green-500" size={10} />
        Depósito
      </Badge>
    );
  }
  if (operation.type === OperationType.EXPENSE) {
    return (
      <Badge className="bg-red-500 bg-opacity-10 font-bold text-red-500 hover:bg-muted">
        <CircleIcon className="mr-2 fill-red-500" size={10} />
        Despesa
      </Badge>
    );
  }
  if (operation.type === OperationType.INVESTMENT) {
    return (
      <Badge className="bg-gray-500 bg-opacity-10 font-bold text-gray-500 hover:bg-muted">
        <CircleIcon className="mr-2 fill-gray-500" size={10} />
        Investimento
      </Badge>
    );
  }
};

export default operationTypeBadge;
