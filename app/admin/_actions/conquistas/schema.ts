import { z } from "zod";

export const upsertConquistaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O título é obrigatório." }),
  preRequisito: z.string().trim().optional().nullable(),
  imgConquistaBloq: z.string().trim().optional().nullable(),
  imgConquistaDesb: z.string().trim().optional().nullable(),
  qtdXpMinimo: z.number().int().min(0),
});

export type UpsertConquistaSchema = z.infer<typeof upsertConquistaSchema>;
