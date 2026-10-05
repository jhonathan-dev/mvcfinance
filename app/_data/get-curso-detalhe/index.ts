import { db } from "@/app/_lib/prisma";
import { notFound } from "next/navigation";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

// Curso completo (módulos + lições, na ordem certa) já cruzado com o
// progresso real do usuário: quais lições ele concluiu e se já fez o
// questionário. Usado tanto na tela de detalhe do curso quanto para montar
// a navegação "anterior/próxima" da tela de lição.
export const getCursoDetalhe = async (cursoId: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  const curso = await db.curso.findUnique({
    where: { id: cursoId },
    include: {
      temaCurso: true,
      licoesPorCurso: true,
      questionario: true,
      modulos: {
        orderBy: { ordem: "asc" },
        include: {
          licoes: { orderBy: { ordem: "asc" } },
        },
      },
    },
  });

  if (!curso) {
    notFound();
  }

  const todasLicoes = curso.modulos.flatMap((m) => m.licoes);

  const [progressoLicoes, progressoQuestionario, calculo] = await Promise.all([
    db.progressoUsuarioLicao.findMany({
      where: {
        usuarioId: usuario.id,
        licaoId: { in: todasLicoes.map((l) => l.id) },
      },
    }),
    curso.questionario
      ? db.progressoUsuarioQuestionario.findUnique({
          where: {
            usuarioId_questionarioId: {
              usuarioId: usuario.id,
              questionarioId: curso.questionario.id,
            },
          },
        })
      : null,
    db.calculoDeProgresso.findUnique({
      where: { usuarioId_cursoId: { usuarioId: usuario.id, cursoId } },
    }),
  ]);

  const concluidasPorLicao = new Map(
    progressoLicoes.map((p) => [p.licaoId, p.licaoRealizada]),
  );

  const modulos = curso.modulos.map((modulo) => ({
    ...modulo,
    licoes: modulo.licoes.map((licao) => ({
      ...licao,
      concluida: concluidasPorLicao.get(licao.id) ?? false,
    })),
  }));

  const proximaLicao =
    modulos.flatMap((m) => m.licoes).find((l) => !l.concluida) ?? null;

  return {
    usuario,
    curso: {
      ...curso,
      modulos,
      qtdLicoes: curso.licoesPorCurso?.qtdLicoes ?? todasLicoes.length,
      duracaoTotal: curso.licoesPorCurso?.duracaoTotal ?? curso.duracao,
    },
    progressoQuestionario,
    calculo,
    proximaLicao,
  };
};

export type CursoDetalhe = Awaited<ReturnType<typeof getCursoDetalhe>>;
