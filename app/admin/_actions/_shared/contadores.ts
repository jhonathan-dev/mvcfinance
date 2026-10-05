import { db } from "@/app/_lib/prisma";

// Mantém LicoesPorModulo e LicoesPorCurso sempre em dia (dado derivado,
// recalculado toda vez que uma Lição ou um Módulo muda), conforme decidido
// para o módulo educacional: contadores são dado de leitura rápida, nunca
// calculados "na mão" pela tela.

export const recalcularLicoesPorModulo = async (moduloId: string) => {
  const qtdLicoes = await db.licao.count({ where: { moduloId } });

  await db.licoesPorModulo.upsert({
    where: { moduloId },
    update: { qtdLicoes },
    create: { moduloId, qtdLicoes },
  });
};

export const recalcularLicoesPorCurso = async (cursoId: string) => {
  const licoes = await db.licao.findMany({
    where: { cursoId },
    select: { duracao: true },
  });

  const qtdLicoes = licoes.length;
  const duracaoTotal = licoes.reduce((total, l) => total + l.duracao, 0);

  await db.licoesPorCurso.upsert({
    where: { cursoId },
    update: { qtdLicoes, duracaoTotal },
    create: { cursoId, qtdLicoes, duracaoTotal },
  });
};
