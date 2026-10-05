"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { UpsertConquistaSchema, upsertConquistaSchema } from "./schema";
import { deleteImage } from "@/app/_actions/upload-image";

export const upsertConquista = async (params: UpsertConquistaSchema) => {
  const { id, ...data } = upsertConquistaSchema.parse(params);

  if (id) {
    const atual = await db.conquista.findUniqueOrThrow({ where: { id } });
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
    await db.conquista.update({ where: { id }, data });
  } else {
    await db.conquista.create({ data });
  }

  revalidatePath("/admin/conquistas");
};

export const deleteConquista = async (id: string) => {
  const conquista = await db.conquista.findUniqueOrThrow({ where: { id } });

  await db.conquista.delete({ where: { id } });

  if (conquista.imgConquistaBloq) await deleteImage(conquista.imgConquistaBloq);
  if (conquista.imgConquistaDesb) await deleteImage(conquista.imgConquistaDesb);

  revalidatePath("/admin/conquistas");
};
