"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { diferenca } from "@/app/_lib/auditoria";
import { UpsertTemaSchema, upsertTemaSchema, deleteTemaSchema } from "./schema";
import {
  ErroDeNegocio,
  executarAdmin,
  type Resultado,
} from "../_shared/resultado";
import { chave } from "../_shared/validacao";

export const upsertTema = async (
  params: UpsertTemaSchema,
): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    const { id, ...dados } = upsertTemaSchema.parse(params);
    ctx.acao(id ? "tema.editar" : "tema.criar");
    ctx.alvo("Tema de curso", id, dados.titulo);

    const temas = await db.temaCurso.findMany({
      select: { id: true, titulo: true, ordem: true },
    });

    const mesmoTitulo = temas.find(
      (t) => t.id !== id && chave(t.titulo) === chave(dados.titulo),
    );
    if (mesmoTitulo) {
      throw new ErroDeNegocio(
        `Já existe um tema com esse título ("${mesmoTitulo.titulo}").`,
      );
    }

    // A ordem dos temas define a trilha de cursos (quem vem antes libera o
    // próximo), então duas posições iguais deixariam a trilha ambígua.
    const mesmaPosicao = temas.find(
      (t) => t.id !== id && t.ordem === dados.ordem,
    );
    if (mesmaPosicao) {
      throw new ErroDeNegocio(
        `A posição ${dados.ordem} já é do tema "${mesmaPosicao.titulo}". Escolha outra posição.`,
      );
    }

    if (id) {
      const atual = await db.temaCurso.findUniqueOrThrow({ where: { id } });
      ctx.detalhes(diferenca(atual, dados));
      await db.temaCurso.update({ where: { id }, data: dados });
    } else {
      ctx.detalhes({ dados });
      await db.temaCurso.create({ data: dados });
    }

    revalidatePath("/admin/temas");
  }, "tema.editar");

export const deleteTema = async (params: { id: string }): Promise<Resultado> =>
  executarAdmin(async (ctx) => {
    deleteTemaSchema.parse(params);
    const tema = await db.temaCurso.findUnique({ where: { id: params.id } });
    ctx.alvo("Tema de curso", params.id, tema?.titulo);

    const qtdCursos = await db.curso.count({
      where: { temaCursoId: params.id },
    });
    if (qtdCursos > 0) {
      throw new ErroDeNegocio(
        `Este tema tem ${qtdCursos} curso(s). Mova ou exclua os cursos antes de excluir o tema.`,
      );
    }

    await db.temaCurso.delete({ where: { id: params.id } });
    revalidatePath("/admin/temas");
  }, "tema.excluir");
