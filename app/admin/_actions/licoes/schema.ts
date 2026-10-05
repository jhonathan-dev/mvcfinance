import { z } from "zod";

export const upsertLicaoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  conteudo: z.string().trim().min(1, { message: "O conteúdo é obrigatório." }),
  imagem: z.string().trim().optional().nullable(),
  resumo: z.string().trim().min(1, { message: "O resumo é obrigatório." }),
  duracao: z.number().int().positive({ message: "A duração é obrigatória." }),
  ordem: z.number().int().min(1),
  desbloqueado: z.boolean(),
  cursoId: z.string().uuid(),
  moduloId: z.string().uuid(),
});

export type UpsertLicaoSchema = z.infer<typeof upsertLicaoSchema>;
