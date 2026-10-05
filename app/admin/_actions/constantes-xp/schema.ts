import { z } from "zod";

export const updateConstantesXPSchema = z.object({
  qtdXpCurso: z.number().int().min(0),
  qtdXpLicao: z.number().int().min(0),
  qtdXpQuestionario: z.number().int().min(0),
});

export type UpdateConstantesXPSchema = z.infer<typeof updateConstantesXPSchema>;
