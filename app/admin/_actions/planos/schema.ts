import { z } from "zod";

export const beneficioPlanoSchema = z.object({
  id: z.string().uuid().optional(),
  beneficio: z.string().trim().min(1, { message: "Descreva o benefício." }),
  limiteOperacoes: z.number().int().positive().optional().nullable(),
});

export const upsertPlanoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  descricao: z.string().trim().optional().nullable(),
  valorMensal: z
    .number()
    .positive({ message: "O valor mensal é obrigatório." }),
  stripePriceId: z.string().trim().optional().nullable(),
  ordem: z.number().int().min(1),
  ativo: z.boolean(),
  beneficios: z.array(beneficioPlanoSchema),
});

export type BeneficioPlanoSchema = z.infer<typeof beneficioPlanoSchema>;
export type UpsertPlanoSchema = z.infer<typeof upsertPlanoSchema>;
