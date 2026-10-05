import { z } from "zod";

export const upsertModuloSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  ordem: z.number().int().min(1),
  desbloqueado: z.boolean(),
  cursoId: z.string().uuid(),
});

export type UpsertModuloSchema = z.infer<typeof upsertModuloSchema>;
