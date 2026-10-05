"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertLicaoSchema, upsertLicaoSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import {
  recalcularLicoesPorModulo,
  recalcularLicoesPorCurso,
} from "../_shared/contadores";

const revalidarTudo = (cursoId: string, moduloId: string) => {
  revalidatePath(`/admin/cursos/${cursoId}/modulos/${moduloId}/licoes`);
  revalidatePath(`/admin/cursos/${cursoId}/modulos`);
  revalidatePath("/admin/cursos");
};

export const upsertLicao = async (params: UpsertLicaoSchema) => {
  const { id, ...data } = upsertLicaoSchema.parse(params);

  let moduloAnteriorId: string | null = null;

  if (id) {
    const atual = await db.licao.findUniqueOrThrow({ where: { id } });
    if (atual.imagem && atual.imagem !== data.imagem) {
      await deleteImage(atual.imagem);
    }
    if (atual.moduloId !== data.moduloId) {
      moduloAnteriorId = atual.moduloId;
    }
    await db.licao.update({ where: { id }, data });
  } else {
    await db.licao.create({ data });
  }

  // Recalcula os contadores sempre — cobre criação, edição de duração e
  // troca de módulo (nesse caso, os dois módulos precisam ser atualizados).
  await recalcularLicoesPorModulo(data.moduloId);
  if (moduloAnteriorId) {
    await recalcularLicoesPorModulo(moduloAnteriorId);
  }
  await recalcularLicoesPorCurso(data.cursoId);

  revalidarTudo(data.cursoId, data.moduloId);
};

export const deleteLicao = async (id: string) => {
  const licao = await db.licao.findUniqueOrThrow({ where: { id } });

  await db.licao.delete({ where: { id } });

  if (licao.imagem) {
    await deleteImage(licao.imagem);
  }

  await recalcularLicoesPorModulo(licao.moduloId);
  await recalcularLicoesPorCurso(licao.cursoId);

  revalidarTudo(licao.cursoId, licao.moduloId);
};

export const toggleLicaoDesbloqueada = async (id: string) => {
  const licao = await db.licao.findUniqueOrThrow({ where: { id } });
  await db.licao.update({
    where: { id },
    data: { desbloqueado: !licao.desbloqueado },
  });
  revalidarTudo(licao.cursoId, licao.moduloId);
};
