import { z } from "zod";
import {
  corHexSchema,
  imagemSchema,
  minutosSchema,
  ordemSchema,
  textoSchema,
  tituloSchema,
} from "../_shared/validacao";

export const upsertCursoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: tituloSchema("O título do curso", 80),
  descricao: textoSchema("A descrição do curso", 20, 500),
  imagem: imagemSchema,
  duracao: minutosSchema("A duração do curso", 6000),
  nivelEnsino: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"], {
    error: "Selecione o nível de ensino.",
  }),
  cor: corHexSchema,
  desbloqueado: z.boolean(),
  ordem: ordemSchema,
  temaCursoId: z
    .string({ error: "O tema é obrigatório." })
    .uuid("O tema é obrigatório."),
});

export type UpsertCursoSchema = z.input<typeof upsertCursoSchema>;
