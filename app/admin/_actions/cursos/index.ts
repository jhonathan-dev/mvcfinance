"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertCursoSchema, upsertCursoSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";

export const upsertCurso = async (params: UpsertCursoSchema) => {
  const { id, ...data } = upsertCursoSchema.parse(params);

  if (id) {
    const atual = await db.curso.findUniqueOrThrow({ where: { id } });

    // Se a imagem foi trocada, remove o arquivo antigo do Vercel Blob
    // para não deixar lixo acumulando no storage.
    if (atual.imagem && atual.imagem !== data.imagem) {
      await deleteImage(atual.imagem);
    }

    await db.curso.update({ where: { id }, data });
  } else {
    // Curso novo: cria junto a linha contadora de LicoesPorCurso já zerada
    // (tabela sempre mantida atualizada, conforme decidido para todo o
    // módulo educacional).
    await db.curso.create({
      data: {
        ...data,
        licoesPorCurso: { create: { qtdLicoes: 0, duracaoTotal: 0 } },
      },
    });
  }

  revalidatePath("/admin/cursos");
};

export const deleteCurso = async (id: string) => {
  const curso = await db.curso.findUniqueOrThrow({ where: { id } });

  // Cascade no schema cuida de apagar módulos, lições, questionário e
  // contadores vinculados a este curso.
  await db.curso.delete({ where: { id } });

  if (curso.imagem) {
    await deleteImage(curso.imagem);
  }

  revalidatePath("/admin/cursos");
};

export const toggleCursoDesbloqueado = async (id: string) => {
  const curso = await db.curso.findUniqueOrThrow({ where: { id } });
  await db.curso.update({
    where: { id },
    data: { desbloqueado: !curso.desbloqueado },
  });
  revalidatePath("/admin/cursos");
};
