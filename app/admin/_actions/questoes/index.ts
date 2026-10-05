"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertQuestaoSchema, upsertQuestaoSchema } from "./schema";

export const upsertQuestao = async (params: UpsertQuestaoSchema) => {
  const { id, alternativas, ...data } = upsertQuestaoSchema.parse(params);

  const questionario = await db.questionario.findUniqueOrThrow({
    where: { id: data.questionarioId },
  });

  await db.$transaction(async (tx) => {
    const questao = id
      ? await tx.questao.update({ where: { id }, data })
      : await tx.questao.create({ data });

    const idsEnviados = alternativas
      .filter((a) => a.id)
      .map((a) => a.id as string);

    // Remove alternativas que existiam antes e não vieram mais no formulário.
    await tx.alternativa.deleteMany({
      where: {
        questaoId: questao.id,
        id: { notIn: idsEnviados.length ? idsEnviados : ["__nenhuma__"] },
      },
    });

    for (let i = 0; i < alternativas.length; i++) {
      const alt = alternativas[i];
      const payload = {
        texto: alt.texto,
        correta: alt.correta,
        explicacao: alt.explicacao || null,
        ordem: i + 1,
      };

      if (alt.id) {
        await tx.alternativa.update({ where: { id: alt.id }, data: payload });
      } else {
        await tx.alternativa.create({
          data: { ...payload, questaoId: questao.id },
        });
      }
    }
  });

  revalidatePath(`/admin/cursos/${questionario.cursoId}/questionario`);
};

export const deleteQuestao = async (id: string, cursoId: string) => {
  // Cascade no schema apaga as alternativas junto.
  await db.questao.delete({ where: { id } });
  revalidatePath(`/admin/cursos/${cursoId}/questionario`);
};

export const toggleQuestaoAtiva = async (id: string, cursoId: string) => {
  const questao = await db.questao.findUniqueOrThrow({ where: { id } });
  await db.questao.update({ where: { id }, data: { ativa: !questao.ativa } });
  revalidatePath(`/admin/cursos/${cursoId}/questionario`);
};
