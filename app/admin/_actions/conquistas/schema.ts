import { z } from "zod";
import { imagemSchema, tituloSchema } from "../_shared/validacao";

export const upsertConquistaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: tituloSchema("O título da conquista", 60),
  // Texto que explica como desbloquear (ex.: "Acumule 300 XP estudando").
  preRequisito: z
    .string()
    .transform((v) => v.trim())
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .refine(
      (v) => !v || v.length >= 5,
      "O pré-requisito precisa ter pelo menos 5 caracteres (ou deixe em branco).",
    )
    .refine(
      (v) => !v || v.length <= 200,
      "O pré-requisito pode ter no máximo 200 caracteres.",
    ),
  imgConquistaBloq: imagemSchema,
  imgConquistaDesb: imagemSchema,
  qtdXpMinimo: z
    .number({ error: "Informe o XP mínimo (um número)." })
    .int("O XP mínimo precisa ser um número inteiro.")
    .min(0, "O XP mínimo não pode ser negativo.")
    .max(1_000_000, "O XP mínimo máximo é 1.000.000."),
});

export type UpsertConquistaSchema = z.input<typeof upsertConquistaSchema>;
