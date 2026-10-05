import { z } from "zod";

export const upsertTipoOperacaoSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  icone: z.string().trim().optional().nullable(),
  ativo: z.boolean(),
});

export type UpsertTipoOperacaoSchema = z.infer<typeof upsertTipoOperacaoSchema>;
