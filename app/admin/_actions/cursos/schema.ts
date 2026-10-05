import { z } from "zod";

export const upsertCursoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  descricao: z
    .string()
    .trim()
    .min(1, { message: "A descrição é obrigatória." }),
  imagem: z.string().trim().optional().nullable(),
  duracao: z.number().int().positive({ message: "A duração é obrigatória." }),
  nivelEnsino: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  cor: z.string().trim().min(1, { message: "A cor é obrigatória." }),
  desbloqueado: z.boolean(),
  ordem: z.number().int().min(1),
  temaCursoId: z.string().uuid({ message: "O tema é obrigatório." }),
});

export type UpsertCursoSchema = z.infer<typeof upsertCursoSchema>;
