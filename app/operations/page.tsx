import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-tabble";
import { operationsColumns } from "./_columns";
import AddOperationButton from "../_components/add-operation-button";
const OperationsPage = async () => {
  const operations = await db.operation.findMany({});
  return (
    <div className="space-y-6 p-6">
      {/* TÍTULO E BOTÃO */}
      <div className="flex w-full items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Transações</h1>
        <AddOperationButton />
      </div>
      <DataTable columns={operationsColumns} data={operations} />
    </div>
  );
};
export default OperationsPage;
