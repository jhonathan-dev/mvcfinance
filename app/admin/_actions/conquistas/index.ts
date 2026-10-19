"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertConquistaSchema, upsertConquistaSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";
import { ErroDeNegocio, executar, type Resultado } from "../_shared/resultado";
import { chave } from "../_shared/validacao";

export const upsertConquista = async (
  params: UpsertConquistaSchema,
): Promise<Resultado> =>
  executar(async () => {
    const { id, ...data } = upsertConquistaSchema.parse(params);

    const conquistas = await db.conquista.findMany({
      select: { id: true, titulo: true, qtdXpMinimo: true },
    });

    const mesmoTitulo = conquistas.find(
      (c) => c.id !== id && chave(c.titulo) === chave(data.titulo),
    );
    if (mesmoTitulo) {
      throw new ErroDeNegocio(
        `Já existe uma conquista com esse título ("${mesmoTitulo.titulo}").`,
      );
    }

    // Duas conquistas no mesmo XP desbloqueiam juntas — na prática é duplicata.
    const mesmoXp = conquistas.find(
      (c) => c.id !== id && c.qtdXpMinimo === data.qtdXpMinimo,
    );
    if (mesmoXp) {
      throw new ErroDeNegocio(
        `A conquista "${mesmoXp.titulo}" já usa ${data.qtdXpMinimo} XP. Escolha um XP mínimo diferente.`,
      );
    }

    if (id) {
      const atual = await db.conquista.findUniqueOrThrow({ where: { id } });
      await db.conquista.update({ where: { id }, data });

      if (
        atual.imgConquistaBloq &&
        atual.imgConquistaBloq !== data.imgConquistaBloq
      ) {
        await deleteImage(atual.imgConquistaBloq);
      }
      if (
        atual.imgConquistaDesb &&
        atual.imgConquistaDesb !== data.imgConquistaDesb
      ) {
        await deleteImage(atual.imgConquistaDesb);
      }
    } else {
      await db.conquista.create({ data });
    }

    revalidatePath("/admin/conquistas");
  });

export const deleteConquista = async (id: string): Promise<Resultado> =>
  executar(async () => {
    const conquista = await db.conquista.findUniqueOrThrow({ where: { id } });

    await db.conquista.delete({ where: { id } });

    if (conquista.imgConquistaBloq)
      await deleteImage(conquista.imgConquistaBloq);
    if (conquista.imgConquistaDesb)
      await deleteImage(conquista.imgConquistaDesb);

    revalidatePath("/admin/conquistas");
  });
