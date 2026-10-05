import { z } from "zod";

export const upsertCategoriaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  tipoOperacaoId: z
    .string()
    .uuid({ message: "O tipo de operação é obrigatório." }),
  ativo: z.boolean(),
});

export type UpsertCategoriaSchema = z.infer<typeof upsertCategoriaSchema>;
