import { z } from "zod";

export const deleteOperacaoSchema = z.object({
  operacaoId: z.string().uuid(),
});

export type DeleteOperacaoSchema = z.infer<typeof deleteOperacaoSchema>;
