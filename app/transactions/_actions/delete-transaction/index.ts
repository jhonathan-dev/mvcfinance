"use server";

import { db } from "@/app/_lib/prisma";
import { DeleteOperacaoSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const deleteTransaction = async ({
  operacaoId,
}: DeleteOperacaoSchema) => {
  await db.operacao.delete({
    where: { id: operacaoId },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
};
