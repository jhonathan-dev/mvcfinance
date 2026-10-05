"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpdateConstantesXPSchema, updateConstantesXPSchema } from "./schema";

// ConstantesXP é singleton: sempre existe exatamente uma linha (criada pelo
// seed). Esta função garante isso mesmo que, por algum motivo, a linha não
// exista ainda.
export const getConstantesXP = async () => {
  const existente = await db.constantesXP.findFirst();
  if (existente) return existente;

  return db.constantesXP.create({
    data: { qtdXpCurso: 100, qtdXpLicao: 20, qtdXpQuestionario: 50 },
  });
};

export const updateConstantesXP = async (params: UpdateConstantesXPSchema) => {
  const data = updateConstantesXPSchema.parse(params);
  const atual = await getConstantesXP();

  await db.constantesXP.update({ where: { id: atual.id }, data });

  revalidatePath("/admin/configuracao-xp");
};
