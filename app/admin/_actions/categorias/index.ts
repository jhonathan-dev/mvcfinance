"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/app/_lib/admin";
import { diferenca, registrarAuditoria } from "@/app/_lib/auditoria";
import { UpsertCategoriaSchema, upsertCategoriaSchema } from "./schema";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";

export const upsertCategoria = async (params: UpsertCategoriaSchema) => {
  await exigirAdmin();
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

  const atual = id ? await db.categoria.findUnique({ where: { id } }) : null;

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

  await registrarAuditoria({
    acao: atual ? "categoria.editar" : "categoria.criar",
    alvoTipo: "Categoria",
    alvoId: id,
    alvoRotulo: rest.nome,
    detalhes: atual ? diferenca(atual, rest) : { dados: rest },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/transactions");
  revalidatePath("/");
};

export const toggleCategoria = async (id: string) => {
  await exigirAdmin();
  const categoria = await db.categoria.findUniqueOrThrow({ where: { id } });
  await db.categoria.update({
    where: { id },
    data: { ativo: !categoria.ativo },
  });
  await registrarAuditoria({
    acao: categoria.ativo ? "categoria.inativar" : "categoria.ativar",
    alvoTipo: "Categoria",
    alvoId: id,
    alvoRotulo: categoria.nome,
  });
  revalidatePath("/admin/categorias");
  revalidatePath("/transactions");
  revalidatePath("/");
};

// Excluir só é permitido para categoria que nunca foi usada. Se já existem
// transações (de qualquer usuário) apontando para ela, apagar quebraria o
// histórico — nesse caso o caminho é inativar (botão de liga/desliga), que a
// tira das telas de nova transação sem mexer nas antigas.
export const deleteCategoria = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const categoria = await db.categoria.findUniqueOrThrow({ where: { id } });
    ctx.alvo("Categoria", id, categoria.nome);

    const emUso = await db.operacao.count({ where: { categoriaId: id } });
    if (emUso > 0) {
      throw new ErroDeNegocio(
        `A categoria "${categoria.nome}" já foi usada em ${emUso} transação(ões) e não pode ser excluída. Inative-a para ela deixar de aparecer em novas transações.`,
      );
    }

    await db.categoria.delete({ where: { id } });

    revalidatePath("/admin/categorias");
    revalidatePath("/transactions");
    revalidatePath("/");
  }, "categoria.excluir");
