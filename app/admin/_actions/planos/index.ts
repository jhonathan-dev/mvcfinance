"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertPlanoSchema, upsertPlanoSchema } from "./schema";

export const upsertPlano = async (params: UpsertPlanoSchema) => {
  const { id, beneficios, ...data } = upsertPlanoSchema.parse(params);

  await db.$transaction(async (tx) => {
    const plano = id
      ? await tx.plano.update({ where: { id }, data })
      : await tx.plano.create({ data });

    const idsEnviados = beneficios
      .filter((b) => b.id)
      .map((b) => b.id as string);

    // Remove benefícios que existiam antes e não vieram mais no formulário.
    await tx.beneficioPlano.deleteMany({
      where: {
        planoId: plano.id,
        id: { notIn: idsEnviados.length ? idsEnviados : ["__nenhum__"] },
      },
    });

    for (const beneficio of beneficios) {
      if (beneficio.id) {
        await tx.beneficioPlano.update({
          where: { id: beneficio.id },
          data: {
            beneficio: beneficio.beneficio,
            limiteOperacoes: beneficio.limiteOperacoes ?? null,
          },
        });
      } else {
        await tx.beneficioPlano.create({
          data: {
            planoId: plano.id,
            beneficio: beneficio.beneficio,
            limiteOperacoes: beneficio.limiteOperacoes ?? null,
          },
        });
      }
    }
  });

  revalidatePath("/admin/planos");
  revalidatePath("/subscription");
};

export const deletePlano = async (id: string) => {
  // Cascade no schema cuida de apagar os benefícios vinculados.
  await db.plano.delete({ where: { id } });
  revalidatePath("/admin/planos");
  revalidatePath("/subscription");
};

export const togglePlanoAtivo = async (id: string) => {
  const plano = await db.plano.findUniqueOrThrow({ where: { id } });
  await db.plano.update({ where: { id }, data: { ativo: !plano.ativo } });
  revalidatePath("/admin/planos");
  revalidatePath("/subscription");
};
