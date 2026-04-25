"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getOperationPaymentMethods = async () => {
  const { userId } = await auth();
  return db.operationPaymentMethod.findMany({
    where: {
      active: true,
      OR: [{ userId: null }, { userId }],
    },
  });
};

export const createOperationPaymentMethod = async (label: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.operationPaymentMethod.create({
    data: { label, userId },
  });
  revalidatePath("/settings");
};

export const deleteOperationPaymentMethod = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const method = await db.operationPaymentMethod.findUnique({ where: { id } });
  if (method?.isDefault)
    throw new Error("Não é possível remover métodos padrão.");
  if (method?.userId !== userId) throw new Error("Unauthorized");

  await db.operationPaymentMethod.update({
    where: { id },
    data: { active: false },
  });
  revalidatePath("/settings");
};
