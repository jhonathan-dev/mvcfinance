"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getOperationCategories = async () => {
  const { userId } = await auth();
  return db.operationCategory.findMany({
    where: {
      active: true,
      OR: [{ userId: null }, { userId }],
    },
  });
};

export const createOperationCategory = async (label: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.operationCategory.create({
    data: { label, userId },
  });
  revalidatePath("/settings");
};

export const deleteOperationCategory = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const category = await db.operationCategory.findUnique({ where: { id } });
  if (category?.isDefault)
    throw new Error("Não é possível remover categorias padrão.");
  if (category?.userId !== userId) throw new Error("Unauthorized");

  await db.operationCategory.update({
    where: { id },
    data: { active: false },
  });
  revalidatePath("/settings");
};
