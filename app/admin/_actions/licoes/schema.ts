import { z } from "zod";
import {
  imagemSchema,
  minutosSchema,
  ordemSchema,
  textoSchema,
  tituloSchema,
} from "../_shared/validacao";

export const upsertLicaoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: tituloSchema("O título da lição", 100),
  conteudo: textoSchema("O conteúdo da lição", 30, 50000),
  imagem: imagemSchema,
  resumo: textoSchema("O resumo da lição", 10, 300),
  duracao: minutosSchema("A duração da lição", 240),
  ordem: ordemSchema,
  desbloqueado: z.boolean(),
  cursoId: z.string().uuid(),
  moduloId: z.string().uuid(),
});

export type UpsertLicaoSchema = z.input<typeof upsertLicaoSchema>;
