import { db } from "@/app/_lib/prisma";
import { DataTable } from "@/app/_components/ui/data-tabble";
import { operationsColumns } from "./_columns";
import AddOperationButton from "@/app/_components/add-operation-button";
import { getOperationTypes } from "@/app/_actions/operation-types";
import { getOperationCategories } from "@/app/_actions/operation-categories";
import { getOperationPaymentMethods } from "@/app/_actions/operation-payment-methods";

const OperationsPage = async () => {
  const [operations, types, categories, paymentMethods] = await Promise.all([
    db.operation.findMany({}),
    getOperationTypes(),
    getOperationCategories(),
    getOperationPaymentMethods(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Operações</h1>
        <AddOperationButton
          types={types}
          categories={categories}
          paymentMethods={paymentMethods}
        />
      </div>
      <DataTable columns={operationsColumns} data={operations} />
    </div>
  );
};

export default OperationsPage;
