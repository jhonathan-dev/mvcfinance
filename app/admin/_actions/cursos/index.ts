"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { diferenca } from "@/app/_lib/auditoria";
import { UpsertCursoSchema, upsertCursoSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { chave } from "../_shared/validacao";
import { exigirCursoPublicavel } from "../_shared/publicacao";

export const upsertCurso = async (
  params: UpsertCursoSchema,
): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const { id, ...data } = upsertCursoSchema.parse(params);
    ctx.acao(id ? "curso.editar" : "curso.criar");
    ctx.alvo("Curso", id, data.titulo);

    const tema = await db.temaCurso.findUnique({
      where: { id: data.temaCursoId },
    });
    if (!tema) {
      throw new ErroDeNegocio(
        "O tema selecionado não existe mais. Atualize a página.",
      );
    }

    const cursos = await db.curso.findMany({
      select: { id: true, titulo: true, ordem: true, temaCursoId: true },
    });

    const mesmoTitulo = cursos.find(
      (c) => c.id !== id && chave(c.titulo) === chave(data.titulo),
    );
    if (mesmoTitulo) {
      throw new ErroDeNegocio(
        `Já existe um curso com esse título ("${mesmoTitulo.titulo}").`,
      );
    }

    // A posição define a trilha (quem vem antes libera o próximo curso e
    // define os 3 cursos do plano gratuito), então não pode repetir no tema.
    const mesmaPosicao = cursos.find(
      (c) =>
        c.id !== id &&
        c.temaCursoId === data.temaCursoId &&
        c.ordem === data.ordem,
    );
    if (mesmaPosicao) {
      throw new ErroDeNegocio(
        `A posição ${data.ordem} já é do curso "${mesmaPosicao.titulo}" neste tema. Escolha outra posição.`,
      );
    }

    if (id) {
      const atual = await db.curso.findUniqueOrThrow({ where: { id } });
      ctx.detalhes(diferenca(atual, data));

      // Ligar o curso ("desbloqueado") exige que ele esteja completo.
      if (data.desbloqueado && !atual.desbloqueado) {
        await exigirCursoPublicavel(db, id);
      }

      await db.curso.update({ where: { id }, data });

      // Se a imagem foi trocada, remove o arquivo antigo do Vercel Blob
      // (só depois de salvar com sucesso, para não perder a imagem se falhar).
      if (atual.imagem && atual.imagem !== data.imagem) {
        await deleteImage(atual.imagem);
      }
    } else {
      if (data.desbloqueado) {
        throw new ErroDeNegocio(
          "Crie o curso bloqueado, cadastre módulos, lições e questionário, e só então desbloqueie.",
        );
      }
      ctx.detalhes({ dados: data });
      // Curso novo: cria junto a linha contadora de LicoesPorCurso já zerada.
      await db.curso.create({
        data: {
          ...data,
          licoesPorCurso: { create: { qtdLicoes: 0, duracaoTotal: 0 } },
        },
      });
    }

    revalidatePath("/admin/cursos");
  }, "curso.editar");

export const deleteCurso = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const curso = await db.curso.findUniqueOrThrow({ where: { id } });
    ctx.alvo("Curso", id, curso.titulo);

    // Excluir apagaria (em cascata) o histórico de estudo de quem já começou.
    const [calculos, licoesFeitas, quizzesFeitos] = await Promise.all([
      db.calculoDeProgresso.count({ where: { cursoId: id } }),
      db.progressoUsuarioLicao.count({ where: { licao: { cursoId: id } } }),
      db.progressoUsuarioQuestionario.count({
        where: { questionario: { cursoId: id } },
      }),
    ]);
    if (calculos + licoesFeitas + quizzesFeitos > 0) {
      throw new ErroDeNegocio(
        'Este curso já tem progresso de alunos e não pode ser excluído (apagaria o histórico deles). Desligue "Desbloqueado" para escondê-lo.',
      );
    }

    // Cascade no schema cuida de apagar módulos, lições, questionário e
    // contadores vinculados a este curso.
    await db.curso.delete({ where: { id } });

    if (curso.imagem) {
      await deleteImage(curso.imagem);
    }

    revalidatePath("/admin/cursos");
  }, "curso.excluir");

export const toggleCursoDesbloqueado = async (id: string): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const curso = await db.curso.findUniqueOrThrow({ where: { id } });
    ctx.acao(curso.desbloqueado ? "curso.bloquear" : "curso.desbloquear");
    ctx.alvo("Curso", id, curso.titulo);

    if (!curso.desbloqueado) {
      await exigirCursoPublicavel(db, id);
    }

    await db.curso.update({
      where: { id },
      data: { desbloqueado: !curso.desbloqueado },
    });
    revalidatePath("/admin/cursos");
  }, "curso.desbloquear");
