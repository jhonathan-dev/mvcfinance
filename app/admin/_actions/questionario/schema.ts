import { z } from "zod";
import { imagemSchema, textoSchema } from "../_shared/validacao";

export const upsertQuestionarioSchema = z.object({
  id: z.string().uuid().optional(),
  descricao: textoSchema("A descrição do questionário", 10, 300),
  imagem: imagemSchema,
  qtdQuestoes: z
    .number({ error: "Informe a quantidade de questões." })
    .int("A quantidade de questões precisa ser um número inteiro.")
    .min(1, "O questionário precisa ter pelo menos 1 questão.")
    .max(50, "O máximo é 50 questões."),
  cursoId: z.string().uuid(),
});

export type UpsertQuestionarioSchema = z.input<typeof upsertQuestionarioSchema>;
