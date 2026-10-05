import { z } from "zod";

export const upsertTemaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  descricao: z
    .string()
    .trim()
    .min(1, { message: "A descrição é obrigatória." }),
  ordem: z.number().int().min(1),
});

export type UpsertTemaSchema = z.infer<typeof upsertTemaSchema>;

export const deleteTemaSchema = z.object({ id: z.string().uuid() });
