import { z } from "zod";
import { chave, ordemSchema, textoSchema } from "../_shared/validacao";

export const alternativaSchema = z.object({
  id: z.string().uuid().optional(),
  texto: textoSchema("O texto da alternativa", 1, 300),
  correta: z.boolean(),
  explicacao: z
    .string()
    .trim()
    .max(500, "A explicação pode ter no máximo 500 caracteres.")
    .optional()
    .nullable(),
});

export const upsertQuestaoSchema = z
  .object({
    id: z.string().uuid().optional(),
    enunciado: textoSchema("O enunciado", 10, 500),
    ativa: z.boolean(),
    ordem: ordemSchema,
    questionarioId: z.string().uuid(),
    alternativas: z
      .array(alternativaSchema)
      .min(2, "Cadastre pelo menos 2 alternativas.")
      .max(6, "O máximo é 6 alternativas."),
  })
  .refine((data) => data.alternativas.filter((a) => a.correta).length === 1, {
    message: "Marque exatamente uma alternativa como correta.",
    path: ["alternativas"],
  })
  .refine(
    (data) => {
      const textos = data.alternativas.map((a) => chave(a.texto));
      return new Set(textos).size === textos.length;
    },
    {
      message:
        "Há alternativas repetidas nesta questão. Cada alternativa precisa ser diferente.",
      path: ["alternativas"],
    },
  );

export type AlternativaSchema = z.input<typeof alternativaSchema>;
export type UpsertQuestaoSchema = z.input<typeof upsertQuestaoSchema>;
