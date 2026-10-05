"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertQuestionarioSchema, upsertQuestionarioSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";

export const upsertQuestionario = async (params: UpsertQuestionarioSchema) => {
  const { id, cursoId, ...data } = upsertQuestionarioSchema.parse(params);

  if (id) {
    const atual = await db.questionario.findUniqueOrThrow({ where: { id } });
    if (atual.imagem && atual.imagem !== data.imagem) {
      await deleteImage(atual.imagem);
    }
    await db.questionario.update({ where: { id }, data });
  } else {
    // cursoId é @unique em Questionario — só existe 1 por curso.
    await db.questionario.create({ data: { ...data, cursoId } });
  }

  revalidatePath(`/admin/cursos/${cursoId}/questionario`);
};
