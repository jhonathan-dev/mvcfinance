"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertModuloSchema, upsertModuloSchema } from "./schema";
import { recalcularLicoesPorCurso } from "../_shared/contadores";
import { ErroDeNegocio, executar, type Resultado } from "../_shared/resultado";
import { chave } from "../_shared/validacao";
import { comGuardaDePublicacao } from "../_shared/publicacao";

export const upsertModulo = async (
  params: UpsertModuloSchema,
): Promise<Resultado> =>
  executar(async () => {
    const { id, ...data } = upsertModuloSchema.parse(params);

    const curso = await db.curso.findUnique({ where: { id: data.cursoId } });
    if (!curso) {
      throw new ErroDeNegocio("O curso não existe mais. Atualize a página.");
    }

    if (id) {
      const atual = await db.modulo.findUniqueOrThrow({ where: { id } });
      if (atual.cursoId !== data.cursoId) {
        throw new ErroDeNegocio(
          "Não é possível mover um módulo para outro curso.",
        );
      }
    }

    const modulos = await db.modulo.findMany({
      where: { cursoId: data.cursoId },
      select: { id: true, titulo: true, ordem: true },
    });

    const mesmoTitulo = modulos.find(
      (m) => m.id !== id && chave(m.titulo) === chave(data.titulo),
    );
    if (mesmoTitulo) {
      throw new ErroDeNegocio(
        `Este curso já tem um módulo com esse título ("${mesmoTitulo.titulo}").`,
      );
    }

    const mesmaPosicao = modulos.find(
      (m) => m.id !== id && m.ordem === data.ordem,
    );
    if (mesmaPosicao) {
      throw new ErroDeNegocio(
        `A posição ${data.ordem} já é do módulo "${mesmaPosicao.titulo}". Escolha outra posição.`,
      );
    }

    if (id) {
      await db.modulo.update({ where: { id }, data });
    } else {
      // Módulo novo: cria junto a linha contadora LicoesPorModulo já zerada.
      await db.modulo.create({
        data: { ...data, licoesPorModulo: { create: { qtdLicoes: 0 } } },
      });
    }

    revalidatePath(`/admin/cursos/${data.cursoId}/modulos`);
  });

export const deleteModulo = async (id: string): Promise<Resultado> =>
  executar(async () => {
    const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });

    const progresso = await db.progressoUsuarioLicao.count({
      where: { licao: { moduloId: id } },
    });
    if (progresso > 0) {
      throw new ErroDeNegocio(
        "Alunos já estudaram lições deste módulo; excluí-lo apagaria o histórico deles. Bloqueie o módulo (ou o curso) em vez de excluir.",
      );
    }

    // Cascade no schema apaga as lições deste módulo (e o que depende delas).
    await comGuardaDePublicacao(modulo.cursoId, (tx) =>
      tx.modulo.delete({ where: { id } }),
    );

    // As lições que sumiram no cascade contavam no total do curso — recalcula.
    await recalcularLicoesPorCurso(modulo.cursoId);

    revalidatePath(`/admin/cursos/${modulo.cursoId}/modulos`);
    revalidatePath("/admin/cursos");
  });

export const toggleModuloDesbloqueado = async (
  id: string,
): Promise<Resultado> =>
  executar(async () => {
    const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });
    await db.modulo.update({
      where: { id },
      data: { desbloqueado: !modulo.desbloqueado },
    });
    revalidatePath(`/admin/cursos/${modulo.cursoId}/modulos`);
  });
