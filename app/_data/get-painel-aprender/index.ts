import { db } from "@/app/_lib/prisma";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";
import { getCursosComProgresso } from "@/app/_data/get-cursos-com-progresso";
import { getConquistasComProgresso } from "@/app/_data/get-conquistas-com-progresso";

// Dados do Painel da seção "Aprender": junta XP, lições concluídas, o curso
// que o usuário está fazendo (com a próxima lição) e prévias de conquistas
// e cursos. Reaproveita as mesmas consultas das telas de Cursos e Conquistas.
export const getPainelAprender = async () => {
  const usuario = await getOrCreateUsuarioAtual();

  const [
    { temas },
    { conquistas },
    totalLicoes,
    licoesConcluidas,
    ultimaLicao,
  ] = await Promise.all([
    getCursosComProgresso(),
    getConquistasComProgresso(),
    db.licao.count(),
    db.progressoUsuarioLicao.count({
      where: { usuarioId: usuario.id, licaoRealizada: true },
    }),
    // Lição concluída mais recentemente — indica o curso "em andamento".
    db.progressoUsuarioLicao.findFirst({
      where: { usuarioId: usuario.id, licaoRealizada: true },
      orderBy: { dataRealizacaoLicao: "desc" },
      include: { licao: { select: { cursoId: true } } },
    }),
  ]);

  const todosCursos = temas.flatMap((t) => t.cursos);
  const cursosDisponiveis = todosCursos.filter((c) => c.acesso.liberado);

  // Curso em andamento: o da última lição concluída, se ainda não terminou;
  // senão o primeiro curso desbloqueado que não está 100%.
  const cursoDaUltimaLicao = ultimaLicao
    ? cursosDisponiveis.find((c) => c.id === ultimaLicao.licao.cursoId)
    : undefined;
  const cursoAtual =
    cursoDaUltimaLicao && cursoDaUltimaLicao.percentualConcluido < 100
      ? cursoDaUltimaLicao
      : (cursosDisponiveis.find((c) => c.percentualConcluido < 100) ?? null);

  let proximaLicao: { id: string; titulo: string; duracao: number } | null =
    null;
  if (cursoAtual) {
    const concluidas = await db.progressoUsuarioLicao.findMany({
      where: {
        usuarioId: usuario.id,
        licaoRealizada: true,
        licao: { cursoId: cursoAtual.id },
      },
      select: { licaoId: true },
    });
    const idsConcluidos = new Set(concluidas.map((p) => p.licaoId));
    const licoesDoCurso = await db.licao.findMany({
      where: { cursoId: cursoAtual.id },
      orderBy: [{ modulo: { ordem: "asc" } }, { ordem: "asc" }],
      select: { id: true, titulo: true, duracao: true },
    });
    proximaLicao = licoesDoCurso.find((l) => !idsConcluidos.has(l.id)) ?? null;
  }

  // Prévia de cursos: em andamento primeiro, depois os ainda não iniciados.
  const cursosPrevia = [...cursosDisponiveis]
    .sort((a, b) => Number(b.iniciado) - Number(a.iniciado))
    .slice(0, 3);

  return {
    usuario,
    totalLicoes,
    licoesConcluidas,
    cursoAtual,
    proximaLicao,
    cursosPrevia,
    conquistas,
  };
};

export type PainelAprender = Awaited<ReturnType<typeof getPainelAprender>>;
