"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";
import {
  adicionarXpEVerificarConquistas,
  getConstantesXPAtual,
  recalcularCalculoDeProgresso,
} from "@/app/_actions/_shared/gamificacao";

// Marca uma lição como concluída (idempotente: só concede XP na primeira
// vez) e já recalcula o % do curso e verifica conquistas desbloqueadas.
export const concluirLicao = async (licaoId: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  const licao = await db.licao.findUnique({ where: { id: licaoId } });
  if (!licao) {
    throw new Error("Lição não encontrada");
  }

  const progressoExistente = await db.progressoUsuarioLicao.findUnique({
    where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
  });

  if (progressoExistente?.licaoRealizada) {
    // Já estava concluída — não concede XP de novo, só confirma o estado atual.
    return { xpGanho: 0, conquistasDesbloqueadas: [] as { titulo: string }[] };
  }

  await db.progressoUsuarioLicao.upsert({
    where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
    update: { licaoRealizada: true, dataRealizacaoLicao: new Date() },
    create: {
      usuarioId: usuario.id,
      licaoId,
      licaoRealizada: true,
      dataRealizacaoLicao: new Date(),
    },
  });

  const constantes = await getConstantesXPAtual();
  const { conquistasDesbloqueadas } = await adicionarXpEVerificarConquistas(
    usuario.id,
    constantes.qtdXpLicao,
  );
  await recalcularCalculoDeProgresso(usuario.id, licao.cursoId);

  revalidatePath(`/cursos/${licao.cursoId}`);
  revalidatePath(`/cursos/${licao.cursoId}/licoes/${licaoId}`);
  revalidatePath("/cursos");
  revalidatePath("/conquistas");

  return {
    xpGanho: constantes.qtdXpLicao,
    conquistasDesbloqueadas: conquistasDesbloqueadas.map((c) => ({
      titulo: c.titulo,
    })),
  };
};
