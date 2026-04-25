import { Settings } from "lucide-react";
import {
  getOperationTypes,
  createOperationType,
  deleteOperationType,
} from "@/app/_actions/operation-types";
import {
  getOperationCategories,
  createOperationCategory,
  deleteOperationCategory,
} from "@/app/_actions/operation-categories";
import {
  getOperationPaymentMethods,
  createOperationPaymentMethod,
  deleteOperationPaymentMethod,
} from "@/app/_actions/operation-payment-methods";
import ManageItemsSection from "./_components/manage-items-section";

const SettingsPage = async () => {
  const [types, categories, paymentMethods] = await Promise.all([
    getOperationTypes(),
    getOperationCategories(),
    getOperationPaymentMethods(),
  ]);

  return (
    <div className="min-h-screen space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-sm text-white/50">
            Gerencie os tipos, categorias e métodos de pagamento das suas
            operações.
          </p>
        </div>
      </div>

      {/* Seções */}
      <div className="max-w-2xl space-y-4">
        <ManageItemsSection
          title="Tipos de Operação"
          items={types}
          onAdd={createOperationType}
          onDelete={deleteOperationType}
        />

        <ManageItemsSection
          title="Categorias"
          items={categories}
          onAdd={createOperationCategory}
          onDelete={deleteOperationCategory}
        />

        <ManageItemsSection
          title="Métodos de Pagamento"
          items={paymentMethods}
          onAdd={createOperationPaymentMethod}
          onDelete={deleteOperationPaymentMethod}
        />
      </div>

      {/* Legenda */}
      <div className="flex max-w-2xl items-center gap-2 text-xs text-white/30">
        <span>🔒 Itens padrão do sistema não podem ser removidos.</span>
      </div>
    </div>
  );
};

export default SettingsPage;
