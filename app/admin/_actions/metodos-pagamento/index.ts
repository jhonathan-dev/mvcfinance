"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  UpsertMetodoPagamentoSchema,
  upsertMetodoPagamentoSchema,
} from "./schema";

export const upsertMetodoPagamento = async (
  params: UpsertMetodoPagamentoSchema,
) => {
  const data = upsertMetodoPagamentoSchema.parse(params);
  const { id, ...rest } = data;

  const duplicado = await db.metodoPagamento.findFirst({
    where: {
      nome: { equals: rest.nome, mode: "insensitive" },
      ...(id ? { NOT: { id } } : {}),
    },
  });
  if (duplicado) {
    throw new Error("Já existe um método de pagamento com esse nome.");
  }

  try {
    await db.metodoPagamento.upsert({
      update: rest,
      create: rest,
      where: { id: id ?? "" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Já existe um método de pagamento com esse nome.");
    }
    throw error;
  }

  revalidatePath("/admin/metodos-pagamento");
  revalidatePath("/transactions");
  revalidatePath("/");
};

export const toggleMetodoPagamento = async (id: string) => {
  const metodo = await db.metodoPagamento.findUniqueOrThrow({ where: { id } });
  await db.metodoPagamento.update({
    where: { id },
    data: { ativo: !metodo.ativo },
  });
  revalidatePath("/admin/metodos-pagamento");
  revalidatePath("/transactions");
  revalidatePath("/");
};
