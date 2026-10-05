import { db } from "@/app/_lib/prisma";
import { notFound } from "next/navigation";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

// Questionário pronto para a tela de quiz: só questões/alternativas ativas,
// e sem o campo `correta` (a correção acontece no servidor, na hora de
// enviar as respostas — nunca manda o gabarito para o cliente).
export const getQuestionarioDetalhe = async (cursoId: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  const curso = await db.curso.findUnique({
    where: { id: cursoId },
    include: {
      questionario: {
        include: {
          questoes: {
            where: { ativa: true },
            orderBy: { ordem: "asc" },
            include: { alternativas: { orderBy: { ordem: "asc" } } },
          },
        },
      },
    },
  });

  if (!curso || !curso.questionario) {
    notFound();
  }

  const progresso = await db.progressoUsuarioQuestionario.findUnique({
    where: {
      usuarioId_questionarioId: {
        usuarioId: usuario.id,
        questionarioId: curso.questionario.id,
      },
    },
  });

  const questoesSemGabarito = curso.questionario.questoes.map((questao) => ({
    id: questao.id,
    enunciado: questao.enunciado,
    alternativas: questao.alternativas.map((alt) => ({
      id: alt.id,
      texto: alt.texto,
    })),
  }));

  return {
    curso: { id: curso.id, titulo: curso.titulo },
    questionario: {
      id: curso.questionario.id,
      descricao: curso.questionario.descricao,
      imagem: curso.questionario.imagem,
    },
    questoes: questoesSemGabarito,
    progresso,
  };
};

export type QuestionarioDetalhe = Awaited<
  ReturnType<typeof getQuestionarioDetalhe>
>;
