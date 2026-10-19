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
  recalcularCalculoDeProgresso,
} from "@/app/_actions/_shared/gamificacao";

type ConquistaResumo = { titulo: string };

// Marca uma lição como concluída e concede o XP — uma única vez por
// usuário/lição, mesmo com clique duplo, duas abas ou retry de rede.
//
// Como a trava funciona: "concluir" é uma troca atômica no banco
// (INSERT ... ON CONFLICT DO NOTHING, ou UPDATE ... WHERE licaoRealizada =
// false). Só UMA requisição consegue fazer a troca; as outras recebem
// count = 0 e saem sem pagar XP. Tudo roda numa transação, então "marcar
// concluída" e "somar XP" nunca ficam pela metade.
export const concluirLicao = async (licaoId: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  const licao = await db.licao.findUnique({ where: { id: licaoId } });
  if (!licao) {
    throw new Error("Lição não encontrada");
  }
  await exigirAcessoAoCurso(licao.cursoId);

  const resultado = await db.$transaction(async (tx) => {
    const agora = new Date();

    const criada = await tx.progressoUsuarioLicao.createMany({
      data: [
        {
          usuarioId: usuario.id,
          licaoId,
          licaoRealizada: true,
          dataRealizacaoLicao: agora,
        },
      ],
      skipDuplicates: true,
    });

    let primeiraVez = criada.count === 1;
    if (!primeiraVez) {
      const atualizada = await tx.progressoUsuarioLicao.updateMany({
        where: { usuarioId: usuario.id, licaoId, licaoRealizada: false },
        data: { licaoRealizada: true, dataRealizacaoLicao: agora },
      });
      primeiraVez = atualizada.count === 1;
    }

    // Já estava concluída (ou outra requisição chegou primeiro): sem XP.
    if (!primeiraVez) return null;

    const constantes = await getConstantesXPAtual(tx);
    const { conquistasDesbloqueadas } = await adicionarXpEVerificarConquistas(
      usuario.id,
      constantes.qtdXpLicao,
      tx,
    );
    await recalcularCalculoDeProgresso(usuario.id, licao.cursoId, tx);

    // Última lição do curso (e quiz aprovado, se houver)? Paga o bônus de curso.
    const bonusCurso = await concederXpDeCursoSeConcluido(
      usuario.id,
      licao.cursoId,
      tx,
    );

    return {
      xpGanho: constantes.qtdXpLicao,
      cursoConcluido: bonusCurso.cursoConcluido,
      xpCurso: bonusCurso.xpCurso,
      conquistas: [
        ...conquistasDesbloqueadas,
        ...bonusCurso.conquistasDesbloqueadas,
      ],
    };
  }, OPCOES_TRANSACAO);

  if (!resultado) {
    return {
      xpGanho: 0,
      xpCurso: 0,
      cursoConcluido: false,
      conquistasDesbloqueadas: [] as ConquistaResumo[],
    };
  }

  revalidatePath("/aprender");
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${licao.cursoId}`);
  revalidatePath(`/cursos/${licao.cursoId}/licoes/${licaoId}`);
  revalidatePath("/conquistas");

  return {
    xpGanho: resultado.xpGanho,
    xpCurso: resultado.xpCurso,
    cursoConcluido: resultado.cursoConcluido,
    conquistasDesbloqueadas: resultado.conquistas.map((c) => ({
      titulo: c.titulo,
    })) as ConquistaResumo[],
  };
};
