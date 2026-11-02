"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/app/_lib/admin";
import { diferenca, registrarAuditoria } from "@/app/_lib/auditoria";
import {
  UpsertMetodoPagamentoSchema,
  upsertMetodoPagamentoSchema,
} from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";

export const upsertMetodoPagamento = async (
  params: UpsertMetodoPagamentoSchema,
) => {
  await exigirAdmin();
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

  const atual = id
    ? await db.metodoPagamento.findUnique({ where: { id } })
    : null;

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

  await registrarAuditoria({
    acao: atual ? "metodo_pagamento.editar" : "metodo_pagamento.criar",
    alvoTipo: "Método de pagamento",
    alvoId: id,
    alvoRotulo: rest.nome,
    detalhes: atual ? diferenca(atual, rest) : { dados: rest },
  });

  revalidatePath("/admin/metodos-pagamento");
  revalidatePath("/transactions");
  revalidatePath("/");
};

export const toggleMetodoPagamento = async (id: string) => {
  await exigirAdmin();
  const metodo = await db.metodoPagamento.findUniqueOrThrow({ where: { id } });
  await db.metodoPagamento.update({
    where: { id },
    data: { ativo: !metodo.ativo },
  });
  await registrarAuditoria({
    acao: metodo.ativo
      ? "metodo_pagamento.inativar"
      : "metodo_pagamento.ativar",
    alvoTipo: "Método de pagamento",
    alvoId: id,
    alvoRotulo: metodo.nome,
  });
  revalidatePath("/admin/metodos-pagamento");
  revalidatePath("/transactions");
  revalidatePath("/");
};

// Só exclui método de pagamento que nunca foi usado em uma transação; senão,
// o caminho é inativar (ele some das telas de nova transação).
export const deleteMetodoPagamento = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const metodo = await db.metodoPagamento.findUniqueOrThrow({
      where: { id },
    });
    ctx.alvo("Método de pagamento", id, metodo.nome);

    const emUso = await db.operacao.count({ where: { metodoPagamentoId: id } });
    if (emUso > 0) {
      throw new ErroDeNegocio(
        `O método "${metodo.nome}" já foi usado em ${emUso} transação(ões) e não pode ser excluído. Inative-o para ele deixar de aparecer em novas transações.`,
      );
    }

    await db.metodoPagamento.delete({ where: { id } });

    // Só depois de excluir com sucesso: não deixa o ícone órfão no Blob.
    await deleteImage(metodo.icone);

    revalidatePath("/admin/metodos-pagamento");
    revalidatePath("/transactions");
    revalidatePath("/");
  }, "metodo_pagamento.excluir");
