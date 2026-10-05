import { db } from "@/app/_lib/prisma";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

// Lista todos os temas com seus cursos (ordenados), cada curso já com o
// progresso real do usuário logado (quantas lições concluiu, % do curso).
// Cursos sem CalculoDeProgresso ainda (usuário nunca começou) voltam com 0%.
export const getCursosComProgresso = async () => {
  const usuario = await getOrCreateUsuarioAtual();

  const [temas, calculos] = await Promise.all([
    db.temaCurso.findMany({
      orderBy: { ordem: "asc" },
      include: {
        cursos: {
          orderBy: { ordem: "asc" },
          include: { licoesPorCurso: true },
        },
      },
    }),
    db.calculoDeProgresso.findMany({ where: { usuarioId: usuario.id } }),
  ]);

  const progressoPorCurso = new Map(calculos.map((c) => [c.cursoId, c]));

  const temasComProgresso = temas.map((tema) => ({
    ...tema,
    cursos: tema.cursos.map((curso) => {
      const progresso = progressoPorCurso.get(curso.id);
      return {
        ...curso,
        qtdLicoes: curso.licoesPorCurso?.qtdLicoes ?? 0,
        duracaoTotal: curso.licoesPorCurso?.duracaoTotal ?? 0,
        licoesConcluidas: progresso?.licoesConcluidas ?? 0,
        percentualConcluido: progresso?.percentualConcluido ?? 0,
        iniciado: !!progresso,
      };
    }),
  }));

  return { usuario, temas: temasComProgresso };
};

export type CursosComProgresso = Awaited<
  ReturnType<typeof getCursosComProgresso>
>;
