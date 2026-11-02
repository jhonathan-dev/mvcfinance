"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { ROLE_ADMIN } from "@/app/_lib/admin";
import { ErroDeNegocio, Resultado, executarAdmin } from "../_shared/resultado";
import {
  banimentoSchema,
  conviteIdSchema,
  conviteSchema,
  papelSchema,
  planoSchema,
  usuarioIdSchema,
} from "./schema";

// Todas as ações abaixo rodam dentro de `executarAdmin`: antes de qualquer
// coisa, o servidor confere que quem chama é admin (a barreira que realmente
// importa) e devolve `{ ok, erro }` com mensagem em português.

const PAGINA = "/admin/usuarios";

// O admin não pode mexer na própria conta por aqui. Isso evita o "tiro no pé"
// clássico (rebaixar, banir ou excluir a si mesmo) e garante que sempre sobra
// pelo menos um administrador: quem executa a ação continua admin.
const exigirOutraConta = async (userId: string) => {
  const { userId: eu } = await auth();
  if (eu === userId) {
    throw new ErroDeNegocio(
      "Você não pode fazer isso com a sua própria conta.",
    );
  }
};

const naoEncontrado = (error: unknown) =>
  isClerkAPIResponseError(error) && error.status === 404;

// Traduz os erros mais comuns do Clerk; os outros viram uma mensagem genérica
// (o texto original do Clerk é em inglês e técnico).
const traduzirErroDoClerk = (error: unknown): never => {
  if (naoEncontrado(error)) {
    throw new ErroDeNegocio(
      "Usuário não encontrado no Clerk. Atualize a página.",
    );
  }
  if (isClerkAPIResponseError(error)) {
    const codigos = error.errors.map((e) => e.code);
    if (
      codigos.includes("form_identifier_exists") ||
      codigos.includes("duplicate_record")
    ) {
      throw new ErroDeNegocio(
        "Já existe uma conta ou um convite pendente para esse e-mail.",
      );
    }
    if (codigos.includes("form_param_format_invalid")) {
      throw new ErroDeNegocio("O e-mail informado é inválido.");
    }
    if (error.status === 429) {
      throw new ErroDeNegocio(
        "Muitas tentativas seguidas. Aguarde um instante e tente de novo.",
      );
    }
  }
  throw error;
};

export const definirPapelAdmin = async (params: {
  userId: string;
  admin: boolean;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const { userId, admin } = papelSchema.parse(params);
    await exigirOutraConta(userId);
    try {
      // updateUserMetadata faz MERGE: preserva subscriptionPlan etc.
      // `null` remove a chave `role`.
      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: { role: admin ? ROLE_ADMIN : null },
      });
    } catch (error) {
      traduzirErroDoClerk(error);
    }
    revalidatePath(PAGINA);
  });

export const definirPlanoPremium = async (params: {
  userId: string;
  premium: boolean;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const { userId, premium } = planoSchema.parse(params);
    try {
      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: { subscriptionPlan: premium ? "premium" : null },
      });
    } catch (error) {
      traduzirErroDoClerk(error);
    }
    revalidatePath(PAGINA);
  });

export const definirBanimento = async (params: {
  userId: string;
  banido: boolean;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const { userId, banido } = banimentoSchema.parse(params);
    await exigirOutraConta(userId);
    try {
      if (banido) await clerkClient().users.banUser(userId);
      else await clerkClient().users.unbanUser(userId);
    } catch (error) {
      traduzirErroDoClerk(error);
    }
    revalidatePath(PAGINA);
  });

export const excluirUsuario = async (params: {
  userId: string;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const userId = usuarioIdSchema.parse(params.userId);
    await exigirOutraConta(userId);

    // 1º o Clerk (é o que pode falhar e não tem volta). Se a conta já não
    // existe lá, segue para limpar os dados que sobraram no nosso banco.
    try {
      await clerkClient().users.deleteUser(userId);
    } catch (error) {
      if (!naoEncontrado(error)) traduzirErroDoClerk(error);
    }

    // 2º os dados do sistema. As operações guardam o id do Clerk (sem
    // relação no banco), então são apagadas à parte; o Usuario apaga em
    // cascata progresso, XP, conquistas, anotações e auditoria.
    await db.$transaction([
      db.operacao.deleteMany({ where: { usuarioId: userId } }),
      db.usuario.deleteMany({ where: { clerkId: userId } }),
    ]);
    revalidatePath(PAGINA);
  });

export const convidarUsuario = async (params: {
  email: string;
  admin: boolean;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const { email, admin } = conviteSchema.parse(params);
    try {
      await clerkClient().invitations.createInvitation({
        emailAddress: email,
        // O metadado do convite passa para a conta quando a pessoa se
        // cadastra: dá para já convidar alguém como administrador.
        publicMetadata: admin ? { role: ROLE_ADMIN } : {},
        ignoreExisting: false,
      });
    } catch (error) {
      traduzirErroDoClerk(error);
    }
    revalidatePath(PAGINA);
  });

export const revogarConvite = async (params: {
  conviteId: string;
}): Promise<Resultado> =>
  executarAdmin(async () => {
    const conviteId = conviteIdSchema.parse(params.conviteId);
    try {
      await clerkClient().invitations.revokeInvitation(conviteId);
    } catch (error) {
      traduzirErroDoClerk(error);
    }
    revalidatePath(PAGINA);
  });
