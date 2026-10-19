"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";
import { exigirAcessoAoCurso } from "@/app/_data/get-acesso-cursos";
import {
  adicionarXpEVerificarConquistas,
  getConstantesXPAtual,
} from "@/app/_actions/_shared/gamificacao";
import {
  ResponderQuestionarioInput,
  responderQuestionarioSchema,
} from "./schema";

const PERCENTUAL_APROVACAO = 0.6;

export const responderQuestionario = async (
  params: ResponderQuestionarioInput,
) => {
  responderQuestionarioSchema.parse(params);
  const { cursoId, questionarioId, respostas } = params;
  const usuario = await getOrCreateUsuarioAtual();
  await exigirAcessoAoCurso(cursoId);

  const questoes = await db.questao.findMany({
    where: { questionarioId, ativa: true },
    include: { alternativas: true },
  });

  const correcao = respostas.map((resposta) => {
    const questao = questoes.find((q) => q.id === resposta.questaoId);
    const alternativaEscolhida = questao?.alternativas.find(
      (a) => a.id === resposta.alternativaId,
    );
    const alternativaCorreta = questao?.alternativas.find((a) => a.correta);
    return {
      questaoId: resposta.questaoId,
      correta: !!alternativaEscolhida?.correta,
      alternativaCorretaId: alternativaCorreta?.id ?? null,
      explicacao: alternativaCorreta?.explicacao ?? null,
    };
  });

  const qtdAcertos = correcao.filter((c) => c.correta).length;
  const aprovado =
    qtdAcertos / Math.max(questoes.length, 1) >= PERCENTUAL_APROVACAO;

  const progressoAnterior = await db.progressoUsuarioQuestionario.findUnique({
    where: {
      usuarioId_questionarioId: { usuarioId: usuario.id, questionarioId },
    },
  });
  const jaHaviaSidoAprovadoAntes = !!progressoAnterior?.questionarioFeito;

  await db.progressoUsuarioQuestionario.upsert({
    where: {
      usuarioId_questionarioId: { usuarioId: usuario.id, questionarioId },
    },
    update: {
      qtdAcertos,
      questionarioFeito: aprovado || jaHaviaSidoAprovadoAntes,
      dataRealizacaoQuestionario: new Date(),
    },
    create: {
      usuarioId: usuario.id,
      questionarioId,
      qtdAcertos,
      questionarioFeito: aprovado,
      dataRealizacaoQuestionario: new Date(),
    },
  });

  let xpGanho = 0;
  let conquistasDesbloqueadas: { titulo: string }[] = [];

  // XP do questionário só é concedido uma vez, na primeira aprovação.
  if (aprovado && !jaHaviaSidoAprovadoAntes) {
    const constantes = await getConstantesXPAtual();
    const resultado = await adicionarXpEVerificarConquistas(
      usuario.id,
      constantes.qtdXpQuestionario,
    );
    xpGanho = constantes.qtdXpQuestionario;
    conquistasDesbloqueadas = resultado.conquistasDesbloqueadas.map((c) => ({
      titulo: c.titulo,
    }));
  }

  revalidatePath(`/cursos/${cursoId}`);
  revalidatePath("/conquistas");

  return {
    qtdAcertos,
    totalQuestoes: questoes.length,
    aprovado,
    correcao,
    xpGanho,
    conquistasDesbloqueadas,
  };
};
