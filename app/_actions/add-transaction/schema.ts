import { z } from "zod";

export const upsertOperacaoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  valor: z.number().positive({ message: "O valor é obrigatório." }),
  tipoOperacaoId: z.string().uuid({ message: "O tipo é obrigatório." }),
  categoriaId: z.string().uuid({ message: "A categoria é obrigatória." }),
  metodoPagamentoId: z
    .string()
    .uuid({ message: "O método de pagamento é obrigatório." }),
  data: z.date({ message: "A data é obrigatória." }),
});

export type UpsertOperacaoSchema = z.infer<typeof upsertOperacaoSchema>;
