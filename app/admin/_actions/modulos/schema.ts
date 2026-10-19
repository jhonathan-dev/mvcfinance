import { z } from "zod";
import { ordemSchema, tituloSchema } from "../_shared/validacao";

export const upsertModuloSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: tituloSchema("O título do módulo", 80),
  ordem: ordemSchema,
  desbloqueado: z.boolean(),
  cursoId: z.string().uuid(),
});

export type UpsertModuloSchema = z.input<typeof upsertModuloSchema>;
