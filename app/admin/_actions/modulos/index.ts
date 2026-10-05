"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertModuloSchema, upsertModuloSchema } from "./schema";
import { recalcularLicoesPorCurso } from "../_shared/contadores";

export const upsertModulo = async (params: UpsertModuloSchema) => {
  const { id, ...data } = upsertModuloSchema.parse(params);

  if (id) {
    await db.modulo.update({ where: { id }, data });
  } else {
    // Módulo novo: cria junto a linha contadora LicoesPorModulo já zerada.
    await db.modulo.create({
      data: {
        ...data,
        licoesPorModulo: { create: { qtdLicoes: 0 } },
      },
    });
  }

  revalidatePath(`/admin/cursos/${data.cursoId}/modulos`);
};

export const deleteModulo = async (id: string) => {
  const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });

  // Cascade no schema apaga as lições deste módulo (e o que depende delas).
  await db.modulo.delete({ where: { id } });

  // As lições que sumiram no cascade contavam no total do curso — recalcula.
  await recalcularLicoesPorCurso(modulo.cursoId);

  revalidatePath(`/admin/cursos/${modulo.cursoId}/modulos`);
  revalidatePath("/admin/cursos");
};

export const toggleModuloDesbloqueado = async (id: string) => {
  const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });
  await db.modulo.update({
    where: { id },
    data: { desbloqueado: !modulo.desbloqueado },
  });
  revalidatePath(`/admin/cursos/${modulo.cursoId}/modulos`);
};
