import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Tipos
  await db.operationType.createMany({
    data: [
      { label: "Depósito", isDefault: true },
      { label: "Despesa", isDefault: true },
      { label: "Investimento", isDefault: true },
    ],
    skipDuplicates: true,
  });

  // Categorias
  await db.operationCategory.createMany({
    data: [
      { label: "Moradia", isDefault: true },
      { label: "Transporte", isDefault: true },
      { label: "Alimentação", isDefault: true },
      { label: "Entretenimento", isDefault: true },
      { label: "Saúde", isDefault: true },
      { label: "Utilidades", isDefault: true },
      { label: "Salário", isDefault: true },
      { label: "Educação", isDefault: true },
      { label: "Outros", isDefault: true },
    ],
    skipDuplicates: true,
  });

  // Métodos de pagamento
  await db.operationPaymentMethod.createMany({
    data: [
      { label: "Transferência Bancária", isDefault: true },
      { label: "Boleto Bancário", isDefault: true },
      { label: "Dinheiro", isDefault: true },
      { label: "Cartão de Crédito", isDefault: true },
      { label: "Cartão de Débito", isDefault: true },
      { label: "Pix", isDefault: true },
      { label: "Outros", isDefault: true },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log("Seed concluído!");
    db.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
