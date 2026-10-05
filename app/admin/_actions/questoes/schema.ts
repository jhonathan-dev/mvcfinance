import { z } from "zod";

export const alternativaSchema = z.object({
  id: z.string().uuid().optional(),
  texto: z
    .string()
    .trim()
    .min(1, { message: "Toda alternativa precisa de um texto." }),
  correta: z.boolean(),
  explicacao: z.string().trim().optional().nullable(),
});

export const upsertQuestaoSchema = z
  .object({
    id: z.string().uuid().optional(),
    enunciado: z
      .string()
      .trim()
      .min(1, { message: "O enunciado é obrigatório." }),
    ativa: z.boolean(),
    ordem: z.number().int().min(1),
    questionarioId: z.string().uuid(),
    alternativas: z.array(alternativaSchema).min(2, {
      message: "Cadastre pelo menos 2 alternativas.",
    }),
  })
  .refine((data) => data.alternativas.filter((a) => a.correta).length === 1, {
    message: "Marque exatamente uma alternativa como correta.",
    path: ["alternativas"],
  });

export type AlternativaSchema = z.infer<typeof alternativaSchema>;
export type UpsertQuestaoSchema = z.infer<typeof upsertQuestaoSchema>;
