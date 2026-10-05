"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UpsertOperacaoSchema, upsertOperacaoSchema } from "./schema";

export const upsertTransaction = async (params: UpsertOperacaoSchema) => {
  upsertOperacaoSchema.parse(params);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const { id, ...data } = params;
  await db.operacao.upsert({
    update: { ...data, usuarioId: userId },
    create: { ...data, usuarioId: userId },
    where: { id: id ?? "" },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
};
