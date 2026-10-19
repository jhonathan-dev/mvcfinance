import { db } from "@/app/_lib/prisma";
import type { Conquista, Prisma } from "@prisma/client";

// Todas as funções aceitam um `client` opcional: dentro de uma
// `db.$transaction` passe o `tx`, para que "reivindicar a ação + conceder o
// XP" aconteça tudo junto (ou nada acontece). Sem `client`, usa o `db`.
export type ClienteDb = Prisma.TransactionClient;

// Config global de XP (ConstantesXP é uma "tabela singleton" — sempre uma
// única linha). Mesmo helper lazy-create usado na tela de admin.
export const getConstantesXPAtual = async (client: ClienteDb = db) => {
  const existente = await client.constantesXP.findFirst();
  if (existente) return existente;
  return client.constantesXP.create({ data: {} });
};

type ConquistaDesbloqueada = Pick<Conquista, "id" | "titulo">;

// Soma XP ao usuário e desbloqueia automaticamente qualquer Conquista cujo
// qtdXpMinimo tenha sido atingido. Retorna o usuário atualizado e a lista de
// conquistas desbloqueadas agora mesmo (para a tela poder comemorar).
export const adicionarXpEVerificarConquistas = async (
  usuarioId: string,
  quantidade: number,
  client: ClienteDb = db,
) => {
  const usuarioAtualizado = await client.usuario.update({
    where: { id: usuarioId },
    data: { totalXp: { increment: quantidade } },
  });

  const conquistasElegiveis = await client.conquista.findMany({
    where: { qtdXpMinimo: { lte: usuarioAtualizado.totalXp } },
  });

  const conquistasDesbloqueadas: ConquistaDesbloqueada[] = [];
  if (conquistasElegiveis.length === 0) {
    return { usuario: usuarioAtualizado, conquistasDesbloqueadas };
  }

  const jaDesbloqueadas = await client.progressoUsuarioConquista.findMany({
    where: {
      usuarioId,
      conquistaId: { in: conquistasElegiveis.map((c) => c.id) },
    },
    select: { conquistaId: true },
  });
  const idsJaDesbloqueados = new Set(jaDesbloqueadas.map((p) => p.conquistaId));

  for (const conquista of conquistasElegiveis) {
    if (idsJaDesbloqueados.has(conquista.id)) continue;

    // createMany + skipDuplicates é atômico: se outra requisição desbloqueou
    // a mesma conquista no mesmo instante, `count` volta 0 e não anunciamos
    // (nem gravamos) duas vezes.
    const criada = await client.progressoUsuarioConquista.createMany({
      data: [
        { usuarioId, conquistaId: conquista.id, qtdConquistasDesbloqueadas: 1 },
      ],
      skipDuplicates: true,
    });
    if (criada.count === 1) {
      conquistasDesbloqueadas.push({
        id: conquista.id,
        titulo: conquista.titulo,
      });
    }
  }

  return { usuario: usuarioAtualizado, conquistasDesbloqueadas };
};

// Recalcula o CalculoDeProgresso (lições concluídas + % do curso) de um
// usuário em um curso específico. Chamado toda vez que uma lição é marcada
// como concluída naquele curso.
export const recalcularCalculoDeProgresso = async (
  usuarioId: string,
  cursoId: string,
  client: ClienteDb = db,
) => {
  const [licoesPorCurso, licoesConcluidas] = await Promise.all([
    client.licoesPorCurso.findUnique({ where: { cursoId } }),
    client.progressoUsuarioLicao.count({
      where: {
        usuarioId,
        licaoRealizada: true,
        licao: { cursoId },
      },
    }),
  ]);

  const totalLicoes = licoesPorCurso?.qtdLicoes ?? 0;
  const percentualConcluido =
    totalLicoes > 0
      ? Math.min(100, Math.round((licoesConcluidas / totalLicoes) * 100))
      : 0;

  // Garante a linha sem estourar a unique em chamadas simultâneas
  // (diferente do upsert, que pode falhar quando duas criações colidem).
  await client.calculoDeProgresso.createMany({
    data: [{ usuarioId, cursoId }],
    skipDuplicates: true,
  });

  return client.calculoDeProgresso.update({
    where: { usuarioId_cursoId: { usuarioId, cursoId } },
    data: { licoesConcluidas, percentualConcluido },
  });
};

export type ResultadoConclusaoCurso = {
  cursoConcluido: boolean; // true só na vez em que o bônus foi concedido
  xpCurso: number;
  conquistasDesbloqueadas: ConquistaDesbloqueada[];
};

const SEM_BONUS_DE_CURSO: ResultadoConclusaoCurso = {
  cursoConcluido: false,
  xpCurso: 0,
  conquistasDesbloqueadas: [],
};

// Verifica se o usuário finalizou o curso (todas as lições concluídas + quiz
// aprovado, quando o curso tem quiz) e, se sim, concede o XP de curso UMA
// única vez.
//
// A trava é a troca atômica `cursoConcluido: false -> true`: o UPDATE só
// afeta uma linha para quem chegar primeiro. Qualquer outra chamada (clique
// duplo, duas abas, retry) encontra `true`, recebe count = 0 e não paga XP.
export const concederXpDeCursoSeConcluido = async (
  usuarioId: string,
  cursoId: string,
  client: ClienteDb = db,
): Promise<ResultadoConclusaoCurso> => {
  const curso = await client.curso.findUnique({
    where: { id: cursoId },
    select: { questionario: { select: { id: true } } },
  });
  if (!curso) return SEM_BONUS_DE_CURSO;

  const totalLicoes = await client.licao.count({ where: { cursoId } });
  if (totalLicoes === 0) return SEM_BONUS_DE_CURSO;

  const licoesConcluidas = await client.progressoUsuarioLicao.count({
    where: { usuarioId, licaoRealizada: true, licao: { cursoId } },
  });
  if (licoesConcluidas < totalLicoes) return SEM_BONUS_DE_CURSO;

  if (curso.questionario) {
    const aprovado = await client.progressoUsuarioQuestionario.count({
      where: {
        usuarioId,
        questionarioId: curso.questionario.id,
        questionarioFeito: true,
      },
    });
    if (aprovado === 0) return SEM_BONUS_DE_CURSO;
  }

  await client.calculoDeProgresso.createMany({
    data: [{ usuarioId, cursoId }],
    skipDuplicates: true,
  });

  const reivindicado = await client.calculoDeProgresso.updateMany({
    where: { usuarioId, cursoId, cursoConcluido: false },
    data: { cursoConcluido: true, concluidoEm: new Date() },
  });
  if (reivindicado.count === 0) return SEM_BONUS_DE_CURSO;

  const constantes = await getConstantesXPAtual(client);
  if (constantes.qtdXpCurso <= 0) {
    return { cursoConcluido: true, xpCurso: 0, conquistasDesbloqueadas: [] };
  }

  const { conquistasDesbloqueadas } = await adicionarXpEVerificarConquistas(
    usuarioId,
    constantes.qtdXpCurso,
    client,
  );
  return {
    cursoConcluido: true,
    xpCurso: constantes.qtdXpCurso,
    conquistasDesbloqueadas,
  };
};

// Opções padrão para as transações de gamificação (o Neon pode demorar um
// pouco para acordar na primeira consulta).
export const OPCOES_TRANSACAO = { maxWait: 10_000, timeout: 20_000 } as const;
