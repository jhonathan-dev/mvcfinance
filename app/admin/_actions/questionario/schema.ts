import { z } from "zod";

export const upsertQuestionarioSchema = z.object({
  id: z.string().uuid().optional(),
  descricao: z
    .string()
    .trim()
    .min(1, { message: "A descrição é obrigatória." }),
  imagem: z.string().trim().optional().nullable(),
  qtdQuestoes: z.number().int().positive(),
  cursoId: z.string().uuid(),
});

export type UpsertQuestionarioSchema = z.infer<typeof upsertQuestionarioSchema>;
