"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Busca tipos globais + os do usuário
export const getOperationTypes = async () => {
  const { userId } = await auth();
  return db.operationType.findMany({
    where: {
      active: true,
      OR: [{ userId: null }, { userId }],
    },
  });
};

// Cria um tipo customizado para o usuário
export const createOperationType = async (label: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.operationType.create({
    data: { label, userId },
  });
  revalidatePath("/settings");
};

// Desativa (soft delete) — não deixa deletar os padrão
export const deleteOperationType = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const type = await db.operationType.findUnique({ where: { id } });
  if (type?.isDefault) throw new Error("Não é possível remover tipos padrão.");
  if (type?.userId !== userId) throw new Error("Unauthorized");

  await db.operationType.update({
    where: { id },
    data: { active: false },
  });
  revalidatePath("/settings");
};
