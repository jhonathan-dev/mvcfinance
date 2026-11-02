"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { diferenca } from "@/app/_lib/auditoria";
import { UpsertModuloSchema, upsertModuloSchema } from "./schema";
import { recalcularLicoesPorCurso } from "../_shared/contadores";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { chave } from "../_shared/validacao";
import { comGuardaDePublicacao } from "../_shared/publicacao";

export const upsertModulo = async (
  params: UpsertModuloSchema,
): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const { id, ...data } = upsertModuloSchema.parse(params);
    ctx.acao(id ? "modulo.editar" : "modulo.criar");
    ctx.alvo("Módulo", id, data.titulo);

    const curso = await db.curso.findUnique({ where: { id: data.cursoId } });
    if (!curso) {
      throw new ErroDeNegocio("O curso não existe mais. Atualize a página.");
    }

    if (id) {
      const atual = await db.modulo.findUniqueOrThrow({ where: { id } });
      ctx.detalhes(diferenca(atual, data));
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
      ctx.detalhes({ dados: data });
      // Módulo novo: cria junto a linha contadora LicoesPorModulo já zerada.
      await db.modulo.create({
        data: { ...data, licoesPorModulo: { create: { qtdLicoes: 0 } } },
      });
    }

    revalidatePath(`/admin/cursos/${data.cursoId}/modulos`);
  }, "modulo.editar");

export const deleteModulo = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });
    ctx.alvo("Módulo", id, modulo.titulo);

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
  }, "modulo.excluir");

export const toggleModuloDesbloqueado = async (
  id: string,
): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const modulo = await db.modulo.findUniqueOrThrow({ where: { id } });
    ctx.acao(modulo.desbloqueado ? "modulo.bloquear" : "modulo.desbloquear");
    ctx.alvo("Módulo", id, modulo.titulo);
    await db.modulo.update({
      where: { id },
      data: { desbloqueado: !modulo.desbloqueado },
    });
    revalidatePath(`/admin/cursos/${modulo.cursoId}/modulos`);
  }, "modulo.desbloquear");
