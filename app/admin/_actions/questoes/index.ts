"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertQuestaoSchema, upsertQuestaoSchema } from "./schema";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { chave } from "../_shared/validacao";
import { comGuardaDePublicacao } from "../_shared/publicacao";

export const upsertQuestao = async (
  params: UpsertQuestaoSchema,
): Promise<Resultado> =>
  executarAdmin(async () => {
    const { id, alternativas, ...data } = upsertQuestaoSchema.parse(params);

    const questionario = await db.questionario.findUnique({
      where: { id: data.questionarioId },
    });
    if (!questionario) {
      throw new ErroDeNegocio(
        "O questionário não existe mais. Atualize a página.",
      );
    }

    const questoes = await db.questao.findMany({
      where: { questionarioId: data.questionarioId },
      select: { id: true, enunciado: true, ordem: true },
    });

    const mesmoEnunciado = questoes.find(
      (q) => q.id !== id && chave(q.enunciado) === chave(data.enunciado),
    );
    if (mesmoEnunciado) {
      throw new ErroDeNegocio(
        "Já existe uma questão com esse enunciado neste questionário.",
      );
    }

    const mesmaPosicao = questoes.find(
      (q) => q.id !== id && q.ordem === data.ordem,
    );
    if (mesmaPosicao) {
      throw new ErroDeNegocio(
        `A posição ${data.ordem} já é de outra questão deste questionário. Escolha outra posição.`,
      );
    }

    if (id) {
      const atual = await db.questao.findUniqueOrThrow({ where: { id } });
      if (atual.questionarioId !== data.questionarioId) {
        throw new ErroDeNegocio("Esta questão pertence a outro questionário.");
      }
    }

    await comGuardaDePublicacao(questionario.cursoId, async (tx) => {
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
  });

// Confere que a questão é mesmo do curso informado e devolve o questionário.
const carregarQuestaoDoCurso = async (id: string, cursoId: string) => {
  const questao = await db.questao.findUniqueOrThrow({
    where: { id },
    include: { questionario: { select: { cursoId: true } } },
  });
  if (questao.questionario.cursoId !== cursoId) {
    throw new ErroDeNegocio(
      "Esta questão pertence a outro curso. Atualize a página.",
    );
  }
  return questao;
};

export const deleteQuestao = async (
  id: string,
  cursoId: string,
): Promise<Resultado> =>
  executarAdmin(async () => {
    await carregarQuestaoDoCurso(id, cursoId);

    // Cascade no schema apaga as alternativas junto.
    await comGuardaDePublicacao(cursoId, (tx) =>
      tx.questao.delete({ where: { id } }),
    );

    revalidatePath(`/admin/cursos/${cursoId}/questionario`);
  });

export const toggleQuestaoAtiva = async (
  id: string,
  cursoId: string,
): Promise<Resultado> =>
  executarAdmin(async () => {
    const questao = await carregarQuestaoDoCurso(id, cursoId);

    await comGuardaDePublicacao(cursoId, (tx) =>
      tx.questao.update({ where: { id }, data: { ativa: !questao.ativa } }),
    );

    revalidatePath(`/admin/cursos/${cursoId}/questionario`);
  });
