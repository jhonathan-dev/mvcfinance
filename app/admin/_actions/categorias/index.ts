"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { UpsertCategoriaSchema, upsertCategoriaSchema } from "./schema";

export const upsertCategoria = async (params: UpsertCategoriaSchema) => {
  const data = upsertCategoriaSchema.parse(params);
  const { id, ...rest } = data;

  // Checagem amigável antes de bater no banco: evita duas categorias com o
  // mesmo nome (sem diferenciar maiúsculas/minúsculas ou espaços) dentro do
  // mesmo tipo de operação.
  const duplicada = await db.categoria.findFirst({
    where: {
      tipoOperacaoId: rest.tipoOperacaoId,
      nome: { equals: rest.nome, mode: "insensitive" },
      ...(id ? { NOT: { id } } : {}),
    },
  });
  if (duplicada) {
    throw new Error(
      "Já existe uma categoria com esse nome para este tipo de operação.",
    );
  }

  try {
    await db.categoria.upsert({
      update: rest,
      create: rest,
      where: { id: id ?? "" },
    });
  } catch (error) {
    // Rede de segurança caso duas requisições caiam na checagem acima ao
    // mesmo tempo (condição de corrida) — o banco ainda barra pela constraint.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        "Já existe uma categoria com esse nome para este tipo de operação.",
      );
    }
    throw error;
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/transactions");
  revalidatePath("/");
};

export const toggleCategoria = async (id: string) => {
  const categoria = await db.categoria.findUniqueOrThrow({ where: { id } });
  await db.categoria.update({
    where: { id },
    data: { ativo: !categoria.ativo },
  });
  revalidatePath("/admin/categorias");
  revalidatePath("/transactions");
  revalidatePath("/");
};
