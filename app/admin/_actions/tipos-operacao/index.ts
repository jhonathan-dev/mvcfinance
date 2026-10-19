"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/app/_lib/admin";
import { UpsertTipoOperacaoSchema, upsertTipoOperacaoSchema } from "./schema";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { deleteImage } from "@/app/_actions/upload-image";

export const upsertTipoOperacao = async (params: UpsertTipoOperacaoSchema) => {
  await exigirAdmin();
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
  await exigirAdmin();
  const tipo = await db.tipoOperacao.findUniqueOrThrow({ where: { id } });
  await db.tipoOperacao.update({ where: { id }, data: { ativo: !tipo.ativo } });
  revalidatePath("/admin/tipos-operacao");
  revalidatePath("/transactions");
  revalidatePath("/");
};

// Um tipo de operação (Depósito, Despesa, Investimento...) é a base das
// categorias e das transações: só pode ser excluído se não tiver nenhuma das
// duas. Caso contrário, o caminho é inativar.
export const deleteTipoOperacao = async (id: string): Promise<Resultado> =>
  executarAdmin(async () => {
    const tipo = await db.tipoOperacao.findUniqueOrThrow({ where: { id } });

    const [categorias, operacoes] = await Promise.all([
      db.categoria.count({ where: { tipoOperacaoId: id } }),
      db.operacao.count({ where: { tipoOperacaoId: id } }),
    ]);
    if (operacoes > 0) {
      throw new ErroDeNegocio(
        `O tipo "${tipo.tipo}" já foi usado em ${operacoes} transação(ões) e não pode ser excluído. Inative-o para ele deixar de aparecer em novas transações.`,
      );
    }
    if (categorias > 0) {
      throw new ErroDeNegocio(
        `O tipo "${tipo.tipo}" tem ${categorias} categoria(s) vinculada(s). Exclua as categorias antes (ou apenas inative o tipo).`,
      );
    }

    await db.tipoOperacao.delete({ where: { id } });

    // Só depois de excluir com sucesso: não deixa o ícone órfão no Blob.
    await deleteImage(tipo.icone);

    revalidatePath("/admin/tipos-operacao");
    revalidatePath("/admin/categorias");
    revalidatePath("/transactions");
    revalidatePath("/");
  });
