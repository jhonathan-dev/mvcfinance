import { z } from "zod";

// Ids de usuário do Clerk sempre começam com "user_". Recusar qualquer outra
// coisa evita que um valor estranho chegue na API do Clerk.
export const usuarioIdSchema = z
  .string()
  .trim()
  .regex(/^user_[A-Za-z0-9]{10,60}$/, "Usuário inválido.");

export const conviteIdSchema = z
  .string()
  .trim()
  .regex(/^inv_[A-Za-z0-9]{10,60}$/, "Convite inválido.");

export const papelSchema = z.object({
  userId: usuarioIdSchema,
  admin: z.boolean(),
});

export const planoSchema = z.object({
  userId: usuarioIdSchema,
  premium: z.boolean(),
});

export const banimentoSchema = z.object({
  userId: usuarioIdSchema,
  banido: z.boolean(),
});

export const conviteSchema = z.object({
  email: z
    .string({ error: "Informe o e-mail." })
    .trim()
    .toLowerCase()
    .max(254, "O e-mail é longo demais.")
    .pipe(z.email("Informe um e-mail válido.")),
  admin: z.boolean(),
});
