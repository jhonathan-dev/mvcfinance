import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ErroDeAcesso, exigirAdmin } from "@/app/_lib/admin";
import { registrarAuditoria } from "@/app/_lib/auditoria";
import type { AcaoAuditoria } from "../../_lib/acoes-auditoria";

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
    if (error instanceof ErroDeNegocio || error instanceof ErroDeAcesso) {
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

// O que cada action conta para a auditoria enquanto roda: qual ação foi
// feita, em quem/o quê, e (opcional) o que mudou.
export interface ContextoAuditoria {
  acao: (acao: AcaoAuditoria) => void;
  alvo: (tipo: string, id?: string | null, rotulo?: string | null) => void;
  detalhes: (detalhes: unknown) => void;
}

// Igual ao `executar`, mas antes de tudo confere que quem chama é admin.
// Toda action de escrita do admin usa esta versão.
//
// Também é aqui que a auditoria é gravada, depois da execução, tanto quando
// deu certo quanto quando falhou (inclusive tentativa sem permissão). A action
// recebe um `ctx` para dizer o que fez; `acaoPadrao` garante que, mesmo se ela
// falhar antes de detalhar, a tentativa fique registrada.
export const executarAdmin = async (
  operacao: (ctx: ContextoAuditoria) => Promise<void>,
  acaoPadrao?: AcaoAuditoria,
): Promise<Resultado> => {
  let acao = acaoPadrao;
  let alvoTipo: string | null = null;
  let alvoId: string | null = null;
  let alvoRotulo: string | null = null;
  let detalhes: unknown;

  const ctx: ContextoAuditoria = {
    acao: (a) => {
      acao = a;
    },
    alvo: (tipo, id, rotulo) => {
      alvoTipo = tipo;
      alvoId = id ?? null;
      alvoRotulo = rotulo ?? null;
    },
    detalhes: (d) => {
      detalhes = d;
    },
  };

  let negado = false;
  const resultado = await executar(async () => {
    try {
      await exigirAdmin();
    } catch (error) {
      if (error instanceof ErroDeAcesso) negado = true;
      throw error;
    }
    await operacao(ctx);
  });

  if (negado) {
    // Quem não é admin chamou uma action do painel (só dá para fazer isso
    // chamando direto, já que os botões nem aparecem): fica registrado.
    await registrarAuditoria({
      acao: "acesso.negado",
      detalhes: { acaoTentada: acaoPadrao ?? null },
      sucesso: false,
      erro: resultado.ok ? null : resultado.erro,
    });
    return resultado;
  }

  if (acao) {
    await registrarAuditoria({
      acao,
      alvoTipo,
      alvoId,
      alvoRotulo,
      detalhes,
      sucesso: resultado.ok,
      erro: resultado.ok ? null : resultado.erro,
    });
  }
  return resultado;
};
