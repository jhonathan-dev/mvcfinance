"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { diferenca } from "@/app/_lib/auditoria";
import { UpsertLicaoSchema, upsertLicaoSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import {
  recalcularLicoesPorModulo,
  recalcularLicoesPorCurso,
} from "../_shared/contadores";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { chave } from "../_shared/validacao";
import { comGuardaDePublicacao } from "../_shared/publicacao";

const revalidarTudo = (cursoId: string, moduloId: string) => {
  revalidatePath(`/admin/cursos/${cursoId}/modulos/${moduloId}/licoes`);
  revalidatePath(`/admin/cursos/${cursoId}/modulos`);
  revalidatePath("/admin/cursos");
};

export const upsertLicao = async (
  params: UpsertLicaoSchema,
): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const { id, ...data } = upsertLicaoSchema.parse(params);
    ctx.acao(id ? "licao.editar" : "licao.criar");
    ctx.alvo("Lição", id, data.titulo);

    // O módulo precisa existir e pertencer ao curso informado.
    const modulo = await db.modulo.findUnique({ where: { id: data.moduloId } });
    if (!modulo || modulo.cursoId !== data.cursoId) {
      throw new ErroDeNegocio(
        "O módulo não pertence a este curso. Atualize a página.",
      );
    }

    const licoesDoCurso = await db.licao.findMany({
      where: { cursoId: data.cursoId },
      select: { id: true, titulo: true, ordem: true, moduloId: true },
    });

    const mesmoTitulo = licoesDoCurso.find(
      (l) => l.id !== id && chave(l.titulo) === chave(data.titulo),
    );
    if (mesmoTitulo) {
      throw new ErroDeNegocio(
        `Este curso já tem uma lição com esse título ("${mesmoTitulo.titulo}").`,
      );
    }

    const mesmaPosicao = licoesDoCurso.find(
      (l) =>
        l.id !== id && l.moduloId === data.moduloId && l.ordem === data.ordem,
    );
    if (mesmaPosicao) {
      throw new ErroDeNegocio(
        `A posição ${data.ordem} já é da lição "${mesmaPosicao.titulo}" neste módulo. Escolha outra posição.`,
      );
    }

    let moduloAnteriorId: string | null = null;
    let imagemAntiga: string | null = null;

    if (id) {
      const atual = await db.licao.findUniqueOrThrow({ where: { id } });
      if (atual.cursoId !== data.cursoId) {
        throw new ErroDeNegocio(
          "Não é possível mover uma lição para outro curso.",
        );
      }
      ctx.detalhes(diferenca(atual, data));
      if (atual.imagem && atual.imagem !== data.imagem)
        imagemAntiga = atual.imagem;
      if (atual.moduloId !== data.moduloId) moduloAnteriorId = atual.moduloId;

      await comGuardaDePublicacao(data.cursoId, (tx) =>
        tx.licao.update({ where: { id }, data }),
      );
    } else {
      ctx.detalhes({ dados: data });
      await db.licao.create({ data });
    }

    if (imagemAntiga) await deleteImage(imagemAntiga);

    // Recalcula os contadores sempre — cobre criação, edição de duração e
    // troca de módulo (nesse caso, os dois módulos precisam ser atualizados).
    await recalcularLicoesPorModulo(data.moduloId);
    if (moduloAnteriorId) {
      await recalcularLicoesPorModulo(moduloAnteriorId);
    }
    await recalcularLicoesPorCurso(data.cursoId);

    revalidarTudo(data.cursoId, data.moduloId);
  }, "licao.editar");

export const deleteLicao = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const licao = await db.licao.findUniqueOrThrow({ where: { id } });
    ctx.alvo("Lição", id, licao.titulo);

    // Apagar uma lição que alunos já concluíram bagunçaria o % de progresso
    // deles (o total do curso muda, mas o % guardado não).
    const concluidas = await db.progressoUsuarioLicao.count({
      where: { licaoId: id },
    });
    if (concluidas > 0) {
      throw new ErroDeNegocio(
        "Alunos já estudaram esta lição; excluí-la bagunçaria o progresso deles. Bloqueie a lição em vez de excluir.",
      );
    }

    await comGuardaDePublicacao(licao.cursoId, (tx) =>
      tx.licao.delete({ where: { id } }),
    );

    if (licao.imagem) {
      await deleteImage(licao.imagem);
    }

    await recalcularLicoesPorModulo(licao.moduloId);
    await recalcularLicoesPorCurso(licao.cursoId);

    revalidarTudo(licao.cursoId, licao.moduloId);
  }, "licao.excluir");

export const toggleLicaoDesbloqueada = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const licao = await db.licao.findUniqueOrThrow({ where: { id } });
    ctx.acao(licao.desbloqueado ? "licao.bloquear" : "licao.desbloquear");
    ctx.alvo("Lição", id, licao.titulo);
    await db.licao.update({
      where: { id },
      data: { desbloqueado: !licao.desbloqueado },
    });
    revalidarTudo(licao.cursoId, licao.moduloId);
  }, "licao.desbloquear");
