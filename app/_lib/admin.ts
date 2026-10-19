import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Quem é administrador: usuários do Clerk cujo `publicMetadata.role` é
// "admin". Quem define isso é o time, direto no painel do Clerk
// (Users -> usuário -> Public metadata -> { "role": "admin" }). O
// `publicMetadata` só pode ser alterado pelo backend/painel do Clerk, então o
// próprio usuário não consegue se promover.
export const ROLE_ADMIN = "admin";

// Erro de permissão: a mensagem pode ser mostrada ao usuário.
export class ErroDeAcesso extends Error {}

// `cache` faz a consulta ao Clerk acontecer uma única vez por requisição, mesmo
// que layout, página e action perguntem várias vezes.
export const isAdmin = cache(async (): Promise<boolean> => {
  const { userId } = await auth();
  if (!userId) return false;

  const usuario = await currentUser();
  return usuario?.publicMetadata?.role === ROLE_ADMIN;
});

// Para Server Actions e funções do servidor: lança erro se quem chama não for
// admin. É a barreira que realmente importa — esconder o botão ou a página não
// impede alguém de chamar a action direto.
export const exigirAdmin = async () => {
  if (!(await isAdmin())) {
    throw new ErroDeAcesso("Você não tem permissão para executar esta ação.");
  }
};

// Para páginas e layouts: sem login vai para /login, sem ser admin volta para
// a página inicial. Precisa estar em TODA página do admin (e não só no layout):
// o Next renderiza páginas de forma parcial, então o layout nem sempre roda
// de novo quando a página é pedida.
export const exigirAdminNaPagina = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  if (!(await isAdmin())) {
    redirect("/");
  }
};
