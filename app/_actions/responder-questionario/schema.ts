import { z } from "zod";

export const respostaSchema = z.object({
  questaoId: z.string().uuid(),
  alternativaId: z.string().uuid(),
});

export const responderQuestionarioSchema = z.object({
  cursoId: z.string().uuid(),
  questionarioId: z.string().uuid(),
  respostas: z.array(respostaSchema).min(1),
});

export type ResponderQuestionarioInput = z.infer<
  typeof responderQuestionarioSchema
>;
