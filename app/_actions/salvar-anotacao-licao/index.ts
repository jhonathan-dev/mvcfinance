"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

export const salvarAnotacaoLicao = async (licaoId: string, texto: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  if (!texto.trim()) {
    await db.anotacaoLicao
      .delete({
        where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
      })
      .catch(() => undefined);
    revalidatePath(`/cursos`);
    return;
  }

  await db.anotacaoLicao.upsert({
    where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
    update: { blocoDeNotas: texto },
    create: { usuarioId: usuario.id, licaoId, blocoDeNotas: texto },
  });
};
