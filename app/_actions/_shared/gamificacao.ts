import { db } from "@/app/_lib/prisma";
import type { Conquista } from "@prisma/client";

// Config global de XP (ConstantesXP é uma "tabela singleton" — sempre uma
// única linha). Mesmo helper lazy-create usado na tela de admin.
export const getConstantesXPAtual = async () => {
  const existente = await db.constantesXP.findFirst();
  if (existente) return existente;
  return db.constantesXP.create({ data: {} });
};

// Soma XP ao usuário e desbloqueia automaticamente qualquer Conquista cujo
// qtdXpMinimo tenha sido atingido. Retorna o usuário atualizado e a lista de
// conquistas desbloqueadas agora mesmo (para a tela poder comemorar).
export const adicionarXpEVerificarConquistas = async (
  usuarioId: string,
  quantidade: number,
) => {
  const usuarioAtualizado = await db.usuario.update({
    where: { id: usuarioId },
    data: { totalXp: { increment: quantidade } },
  });

  const conquistasElegiveis = await db.conquista.findMany({
    where: { qtdXpMinimo: { lte: usuarioAtualizado.totalXp } },
  });

  if (conquistasElegiveis.length === 0) {
    return {
      usuario: usuarioAtualizado,
      conquistasDesbloqueadas: [] as Conquista[],
    };
  }

  const jaDesbloqueadas = await db.progressoUsuarioConquista.findMany({
    where: {
      usuarioId,
      conquistaId: { in: conquistasElegiveis.map((c) => c.id) },
    },
    select: { conquistaId: true },
  });
  const idsJaDesbloqueados = new Set(jaDesbloqueadas.map((p) => p.conquistaId));

  const novasConquistas = conquistasElegiveis.filter(
    (c) => !idsJaDesbloqueados.has(c.id),
  );

  if (novasConquistas.length > 0) {
    await db.progressoUsuarioConquista.createMany({
      data: novasConquistas.map((c) => ({
        usuarioId,
        conquistaId: c.id,
        qtdConquistasDesbloqueadas: 1,
      })),
      skipDuplicates: true,
    });
  }

  return {
    usuario: usuarioAtualizado,
    conquistasDesbloqueadas: novasConquistas,
  };
};

// Recalcula o CalculoDeProgresso (lições concluídas + % do curso) de um
// usuário em um curso específico. Chamado toda vez que uma lição é marcada
// como concluída (ou desfeita) naquele curso.
export const recalcularCalculoDeProgresso = async (
  usuarioId: string,
  cursoId: string,
) => {
  const [licoesPorCurso, licoesConcluidas] = await Promise.all([
    db.licoesPorCurso.findUnique({ where: { cursoId } }),
    db.progressoUsuarioLicao.count({
      where: {
        usuarioId,
        licaoRealizada: true,
        licao: { cursoId },
      },
    }),
  ]);

  const totalLicoes = licoesPorCurso?.qtdLicoes ?? 0;
  const percentualConcluido =
    totalLicoes > 0 ? Math.round((licoesConcluidas / totalLicoes) * 100) : 0;

  return db.calculoDeProgresso.upsert({
    where: { usuarioId_cursoId: { usuarioId, cursoId } },
    update: { licoesConcluidas, percentualConcluido },
    create: { usuarioId, cursoId, licoesConcluidas, percentualConcluido },
  });
};
