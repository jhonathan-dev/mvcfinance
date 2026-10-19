import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// Por que as actions do admin devolvem um "resultado" em vez de lançar erro:
// em produção o Next.js troca a mensagem de qualquer erro lançado numa Server
// Action por um texto genérico ("An error occurred in the Server Components
// render..."). Devolvendo `{ ok: false, erro }`, a mensagem em português
// (ex.: "Já existe um curso com esse título") chega inteira na tela, em
// desenvolvimento e em produção.
export type Resultado = { ok: true } | { ok: false; erro: string };

// Erro "esperado" de regra de negócio (duplicado, posição repetida, curso
// incompleto...). Quem lança isto está dizendo: a mensagem pode ir pro usuário.
export class ErroDeNegocio extends Error {}

export const executar = async (
  operacao: () => Promise<void>,
): Promise<Resultado> => {
  try {
    await operacao();
    return { ok: true };
  } catch (error) {
    if (error instanceof ErroDeNegocio) {
      return { ok: false, erro: error.message };
    }
    if (error instanceof ZodError) {
      return {
        ok: false,
        erro: error.issues[0]?.message ?? "Dados inválidos.",
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Última barreira, no banco: cobre a corrida entre duas pessoas
      // cadastrando o mesmo nome ao mesmo tempo.
      if (error.code === "P2002") {
        return {
          ok: false,
          erro: "Já existe um cadastro com esses dados (nome ou título repetido).",
        };
      }
      if (error.code === "P2003") {
        return {
          ok: false,
          erro: "Este registro está sendo usado por outro cadastro e não pode ser removido.",
        };
      }
      if (error.code === "P2025") {
        return {
          ok: false,
          erro: "Registro não encontrado (talvez já tenha sido removido). Atualize a página.",
        };
      }
    }
    console.error(error);
    return { ok: false, erro: "Erro inesperado. Tente novamente." };
  }
};
