import { z } from "zod";

export const upsertMetodoPagamentoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  icone: z.string().trim().optional().nullable(),
  ativo: z.boolean(),
});

export type UpsertMetodoPagamentoSchema = z.infer<
  typeof upsertMetodoPagamentoSchema
>;
