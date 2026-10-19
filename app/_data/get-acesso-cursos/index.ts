import { db } from "@/app/_lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

// Regras de acesso aos cursos (todas em um lugar só, para ser fácil mudar):
//  1. Plano gratuito: apenas os N primeiros cursos da trilha (LIMITE_CURSOS_FREE).
//     Premium: todos.
//  2. Sequência: um curso só libera quando o curso ANTERIOR da trilha estiver
//     finalizado (todas as lições concluídas + questionário aprovado, se houver).
//  3. O campo Curso.desbloqueado continua valendo como trava manual do admin
//     (ex.: curso ainda não publicado) — se estiver desligado, ninguém acessa.
//
// A "trilha" é a ordem global: Temas por `ordem`, e dentro de cada tema os
// cursos por `ordem`.
export const LIMITE_CURSOS_FREE = 3;

export type MotivoBloqueio = "indisponivel" | "premium" | "anterior";

export type AcessoCurso = {
  liberado: boolean;
  motivo: MotivoBloqueio | null;
  cursoAnteriorTitulo: string | null;
  posicao: number; // 1, 2, 3...
};

export const getAcessoCursos = async () => {
  const usuario = await getOrCreateUsuarioAtual();
  const clerkUser = await currentUser();
  const premium = clerkUser?.publicMetadata?.subscriptionPlan === "premium";

  const cursos = await db.curso.findMany({
    orderBy: [{ temaCurso: { ordem: "asc" } }, { ordem: "asc" }],
    select: {
      id: true,
      titulo: true,
      desbloqueado: true,
      licoesPorCurso: { select: { qtdLicoes: true } },
      questionario: { select: { id: true } },
    },
  });

  const [calculos, questionariosFeitos] = await Promise.all([
    db.calculoDeProgresso.findMany({ where: { usuarioId: usuario.id } }),
    db.progressoUsuarioQuestionario.findMany({
      where: { usuarioId: usuario.id, questionarioFeito: true },
      select: { questionarioId: true },
    }),
  ]);

  const percentualPorCurso = new Map(
    calculos.map((c) => [c.cursoId, c.percentualConcluido]),
  );
  const quizFeito = new Set(questionariosFeitos.map((q) => q.questionarioId));

  const finalizado = (c: (typeof cursos)[number]) => {
    const semLicoes = (c.licoesPorCurso?.qtdLicoes ?? 0) === 0;
    const licoesOk = semLicoes || (percentualPorCurso.get(c.id) ?? 0) >= 100;
    const quizOk = !c.questionario || quizFeito.has(c.questionario.id);
    return licoesOk && quizOk;
  };

  const acessos: Record<string, AcessoCurso> = {};
  cursos.forEach((curso, i) => {
    const anterior = i > 0 ? cursos[i - 1] : null;
    let motivo: MotivoBloqueio | null = null;

    if (!curso.desbloqueado) {
      motivo = "indisponivel";
    } else if (!premium && i >= LIMITE_CURSOS_FREE) {
      motivo = "premium";
    } else if (anterior && !finalizado(anterior)) {
      motivo = "anterior";
    }

    acessos[curso.id] = {
      liberado: motivo === null,
      motivo,
      cursoAnteriorTitulo: motivo === "anterior" ? anterior!.titulo : null,
      posicao: i + 1,
    };
  });

  return { acessos, premium };
};

// Usado pelas Server Actions (concluir lição, responder quiz): recusa a
// operação se o curso estiver bloqueado para o usuário.
export const exigirAcessoAoCurso = async (cursoId: string) => {
  const { acessos } = await getAcessoCursos();
  if (!acessos[cursoId]?.liberado) {
    throw new Error("Este curso está bloqueado para você.");
  }
};
