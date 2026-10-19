import { z } from "zod";

// Blocos de validação reutilizados pelos schemas do admin de educação.
// Ideia: barrar na entrada o que é duplicado ou "sem sentido" (texto de
// 1 letra, "aaaaaa", "123", espaços sobrando, link de imagem inválido...).

const LETRAS = /[A-Za-zÀ-ÖØ-öø-ÿ]/g;

export const limparEspacos = (valor: string) =>
  valor.replace(/\s+/g, " ").trim();

// Chave de comparação para detectar duplicados: ignora maiúsculas, acentos
// e espaços repetidos. "Orçamento  Pessoal" e "orcamento pessoal" colidem.
export const chave = (valor: string) =>
  limparEspacos(valor).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const temLetrasSuficientes = (valor: string) => {
  const letras = valor.match(LETRAS) ?? [];
  return (
    letras.length >= 3 && new Set(letras.map((l) => l.toLowerCase())).size >= 2
  );
};

const semRepeticaoAbsurda = (limite: number) => (valor: string) =>
  !new RegExp(`(.)\\1{${limite},}`, "s").test(valor);

// Título/nome curto: 1 linha, espaços normalizados, com letras de verdade.
export const tituloSchema = (nome: string, max = 80) =>
  z
    .string({ error: `${nome} é obrigatório.` })
    .transform(limparEspacos)
    .pipe(
      z
        .string()
        .min(3, `${nome} precisa ter pelo menos 3 caracteres.`)
        .max(max, `${nome} pode ter no máximo ${max} caracteres.`)
        .refine(
          temLetrasSuficientes,
          `${nome} precisa conter palavras (não só números, símbolos ou uma letra repetida).`,
        )
        .refine(
          semRepeticaoAbsurda(4),
          `${nome} parece inválido (caracteres repetidos demais).`,
        ),
    );

// Texto longo (descrição, conteúdo, enunciado): pode ter várias linhas.
export const textoSchema = (nome: string, min: number, max: number) =>
  z
    .string({ error: `${nome} é obrigatório.` })
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(
          min,
          min === 1
            ? `${nome} não pode ficar vazio.`
            : `${nome} precisa ter pelo menos ${min} caracteres.`,
        )
        .max(max, `${nome} pode ter no máximo ${max} caracteres.`)
        .refine(
          // Textos "de verdade" (enunciado, descrição, conteúdo) precisam ter
          // letras; textos curtos (ex.: alternativa "10%") ficam livres.
          (v) => min < 10 || (v.match(LETRAS) ?? []).length >= 10,
          `${nome} precisa conter texto de verdade.`,
        )
        .refine(
          semRepeticaoAbsurda(11),
          `${nome} parece inválido (caracteres repetidos demais).`,
        ),
    );

// Posição na lista (trilha de temas/cursos, módulos, lições, questões).
export const ordemSchema = z
  .number({ error: "Informe a posição (um número)." })
  .int("A posição precisa ser um número inteiro.")
  .min(1, "A posição mínima é 1.")
  .max(999, "A posição máxima é 999.");

export const minutosSchema = (nome: string, max: number) =>
  z
    .number({ error: `Informe ${nome} (em minutos).` })
    .int(`${nome} precisa ser um número inteiro de minutos.`)
    .min(1, `${nome} precisa ser de pelo menos 1 minuto.`)
    .max(max, `${nome} pode ter no máximo ${max} minutos.`);

// Imagem vem do upload (Vercel Blob): precisa ser um link https. Vazio = sem imagem.
export const imagemSchema = z
  .string()
  .transform((v) => v.trim())
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .refine(
    (v) => !v || /^https:\/\/[^\s]+$/i.test(v),
    "A imagem precisa ser um link https válido (use o botão de upload).",
  );

export const corHexSchema = z
  .string({ error: "A cor é obrigatória." })
  .trim()
  .regex(
    /^#[0-9a-fA-F]{6}$/,
    "A cor precisa estar no formato #RRGGBB (ex.: #2563EB).",
  );
