"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";
import { exigirAcessoAoCurso } from "@/app/_data/get-acesso-cursos";
import {
  OPCOES_TRANSACAO,
  adicionarXpEVerificarConquistas,
  concederXpDeCursoSeConcluido,
  getConstantesXPAtual,
} from "@/app/_actions/_shared/gamificacao";
import {
  ResponderQuestionarioInput,
  responderQuestionarioSchema,
} from "./schema";

const PERCENTUAL_APROVACAO = 0.6;

type ConquistaResumo = { titulo: string };

export const responderQuestionario = async (
  params: ResponderQuestionarioInput,
) => {
  responderQuestionarioSchema.parse(params);
  const { cursoId, questionarioId, respostas } = params;
  const usuario = await getOrCreateUsuarioAtual();
  await exigirAcessoAoCurso(cursoId);

  // O questionário precisa ser mesmo deste curso (evita pagar XP de um quiz
  // trocando os ids na requisição).
  const questionario = await db.questionario.findUnique({
    where: { id: questionarioId },
    select: { cursoId: true },
  });
  if (!questionario || questionario.cursoId !== cursoId) {
    throw new Error("Questionário não encontrado");
  }

  const questoes = await db.questao.findMany({
    where: { questionarioId, ativa: true },
    include: { alternativas: true },
  });

  // Só vale UMA resposta por questão, e só de questões ativas deste quiz.
  // Sem isso, repetir a mesma resposta certa N vezes inflava os acertos.
  const questoesVistas = new Set<string>();
  const respostasValidas = respostas.filter((resposta) => {
    if (questoesVistas.has(resposta.questaoId)) return false;
    if (!questoes.some((q) => q.id === resposta.questaoId)) return false;
    questoesVistas.add(resposta.questaoId);
    return true;
  });

  const correcao = respostasValidas.map((resposta) => {
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

  // Tudo numa transação: registrar a tentativa, pagar o XP do quiz (só na
  // PRIMEIRA aprovação) e o bônus de curso (só na primeira vez que o curso
  // fica completo). Cada "primeira vez" é uma troca atômica no banco, então
  // enviar duas vezes ao mesmo tempo nunca paga duas vezes.
  const resultado = await db.$transaction(async (tx) => {
    const agora = new Date();
    let primeiraAprovacao = false;

    if (aprovado) {
      const criado = await tx.progressoUsuarioQuestionario.createMany({
        data: [
          {
            usuarioId: usuario.id,
            questionarioId,
            qtdAcertos,
            questionarioFeito: true,
            dataRealizacaoQuestionario: agora,
          },
        ],
        skipDuplicates: true,
      });
      primeiraAprovacao = criado.count === 1;

      if (!primeiraAprovacao) {
        const atualizado = await tx.progressoUsuarioQuestionario.updateMany({
          where: {
            usuarioId: usuario.id,
            questionarioId,
            questionarioFeito: false,
          },
          data: {
            questionarioFeito: true,
            qtdAcertos,
            dataRealizacaoQuestionario: agora,
          },
        });
        primeiraAprovacao = atualizado.count === 1;
      }
    }

    if (!primeiraAprovacao) {
      // Reprovado, ou aprovado novamente: só registra a tentativa
      // (questionarioFeito nunca volta para false).
      await tx.progressoUsuarioQuestionario.createMany({
        data: [
          {
            usuarioId: usuario.id,
            questionarioId,
            qtdAcertos,
            questionarioFeito: false,
            dataRealizacaoQuestionario: agora,
          },
        ],
        skipDuplicates: true,
      });
      await tx.progressoUsuarioQuestionario.updateMany({
        where: { usuarioId: usuario.id, questionarioId },
        data: { qtdAcertos, dataRealizacaoQuestionario: agora },
      });
    }

    let xpGanho = 0;
    let xpCurso = 0;
    let cursoConcluido = false;
    const conquistas: ConquistaResumo[] = [];

    if (primeiraAprovacao) {
      const constantes = await getConstantesXPAtual(tx);
      const r = await adicionarXpEVerificarConquistas(
        usuario.id,
        constantes.qtdXpQuestionario,
        tx,
      );
      xpGanho = constantes.qtdXpQuestionario;
      conquistas.push(...r.conquistasDesbloqueadas);
    }

    // Aprovado (nesta ou em outra tentativa): se o curso ficou completo,
    // paga o bônus de curso — a própria função garante que é uma vez só.
    if (aprovado) {
      const bonus = await concederXpDeCursoSeConcluido(usuario.id, cursoId, tx);
      cursoConcluido = bonus.cursoConcluido;
      xpCurso = bonus.xpCurso;
      conquistas.push(...bonus.conquistasDesbloqueadas);
    }

    return { xpGanho, xpCurso, cursoConcluido, conquistas };
  }, OPCOES_TRANSACAO);

  revalidatePath("/aprender");
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${cursoId}`);
  revalidatePath("/conquistas");

  return {
    qtdAcertos,
    totalQuestoes: questoes.length,
    aprovado,
    correcao,
    xpGanho: resultado.xpGanho,
    xpCurso: resultado.xpCurso,
    cursoConcluido: resultado.cursoConcluido,
    conquistasDesbloqueadas: resultado.conquistas.map((c) => ({
      titulo: c.titulo,
    })) as ConquistaResumo[],
  };
};
