"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { UpsertTemaSchema, upsertTemaSchema, deleteTemaSchema } from "./schema";

export const upsertTema = async (params: UpsertTemaSchema) => {
  const data = upsertTemaSchema.parse(params);
  const { id, ...rest } = data;

  const duplicado = await db.temaCurso.findFirst({
    where: {
      titulo: { equals: rest.titulo, mode: "insensitive" },
      ...(id ? { NOT: { id } } : {}),
    },
  });
  if (duplicado) {
    throw new Error("Já existe um tema de curso com esse título.");
  }

  try {
    await db.temaCurso.upsert({
      update: rest,
      create: rest,
      where: { id: id ?? "" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Já existe um tema de curso com esse título.");
    }
    throw error;
  }

  revalidatePath("/admin/temas");
};

export const deleteTema = async (params: { id: string }) => {
  deleteTemaSchema.parse(params);
  await db.temaCurso.delete({ where: { id: params.id } });
  revalidatePath("/admin/temas");
};
