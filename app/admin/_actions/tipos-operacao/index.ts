"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { UpsertTipoOperacaoSchema, upsertTipoOperacaoSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";

export const upsertTipoOperacao = async (params: UpsertTipoOperacaoSchema) => {
  const data = upsertTipoOperacaoSchema.parse(params);
  const { id, ...rest } = data;

  const duplicado = await db.tipoOperacao.findFirst({
    where: {
      tipo: { equals: rest.tipo, mode: "insensitive" },
      ...(id ? { NOT: { id } } : {}),
    },
  });
  if (duplicado) {
    throw new Error("Já existe um tipo de operação com esse nome.");
  }

  if (id) {
    const atual = await db.tipoOperacao.findUniqueOrThrow({ where: { id } });
    if (atual.icone && atual.icone !== rest.icone) {
      await deleteImage(atual.icone);
    }
  }

  try {
    await db.tipoOperacao.upsert({
      update: rest,
      create: rest,
      where: { id: id ?? "" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Já existe um tipo de operação com esse nome.");
    }
    throw error;
  }

  revalidatePath("/admin/tipos-operacao");
  revalidatePath("/admin/categorias");
  revalidatePath("/transactions");
  revalidatePath("/");
};

export const toggleTipoOperacao = async (id: string) => {
  const tipo = await db.tipoOperacao.findUniqueOrThrow({ where: { id } });
  await db.tipoOperacao.update({ where: { id }, data: { ativo: !tipo.ativo } });
  revalidatePath("/admin/tipos-operacao");
  revalidatePath("/transactions");
  revalidatePath("/");
};
