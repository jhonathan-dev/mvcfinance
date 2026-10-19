import { z } from "zod";
import { ordemSchema, textoSchema, tituloSchema } from "../_shared/validacao";

export const upsertTemaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: tituloSchema("O título do tema", 60),
  descricao: textoSchema("A descrição do tema", 10, 300),
  ordem: ordemSchema,
});

export type UpsertTemaSchema = z.input<typeof upsertTemaSchema>;

export const deleteTemaSchema = z.object({ id: z.string().uuid() });
