"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertQuestionarioSchema, upsertQuestionarioSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import { ErroDeNegocio, executar, type Resultado } from "../_shared/resultado";
import { comGuardaDePublicacao } from "../_shared/publicacao";

export const upsertQuestionario = async (
  params: UpsertQuestionarioSchema,
): Promise<Resultado> =>
  executar(async () => {
    const { id, cursoId, ...data } = upsertQuestionarioSchema.parse(params);

    const curso = await db.curso.findUnique({ where: { id: cursoId } });
    if (!curso) {
      throw new ErroDeNegocio("O curso não existe mais. Atualize a página.");
    }

    if (id) {
      const atual = await db.questionario.findUniqueOrThrow({ where: { id } });
      if (atual.cursoId !== cursoId) {
        throw new ErroDeNegocio("Este questionário pertence a outro curso.");
      }
      await db.questionario.update({ where: { id }, data });

      if (atual.imagem && atual.imagem !== data.imagem) {
        await deleteImage(atual.imagem);
      }
    } else {
      // Só existe 1 questionário por curso (cursoId é @unique).
      const existente = await db.questionario.findUnique({
        where: { cursoId },
      });
      if (existente) {
        throw new ErroDeNegocio(
          "Este curso já tem um questionário. Atualize a página para editá-lo.",
        );
      }
      // Um questionário novo nasce sem questões: se o curso já estiver
      // desbloqueado, o guarda recusa (os alunos ficariam presos num quiz
      // vazio). Bloqueie o curso, cadastre as questões e desbloqueie de novo.
      await comGuardaDePublicacao(cursoId, (tx) =>
        tx.questionario.create({ data: { ...data, cursoId } }),
      );
    }

    revalidatePath(`/admin/cursos/${cursoId}/questionario`);
  });
