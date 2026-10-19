import { z } from "zod";

const xp = (nome: string) =>
  z
    .number({ error: `Informe o XP ${nome} (um número).` })
    .int(`O XP ${nome} precisa ser um número inteiro.`)
    .min(0, `O XP ${nome} não pode ser negativo.`)
    .max(10_000, `O XP ${nome} pode ser no máximo 10.000.`);

export const updateConstantesXPSchema = z.object({
  qtdXpCurso: xp("por curso"),
  qtdXpLicao: xp("por lição"),
  qtdXpQuestionario: xp("por questionário"),
});

export type UpdateConstantesXPSchema = z.input<typeof updateConstantesXPSchema>;
