import { db } from "@/app/_lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// Usuario.clerkId é a ponte com o Clerk. Usuario.id (uuid próprio) é a FK
// usada em todas as tabelas de progresso/gamificação. Como ainda não existe
// nenhum gatilho que crie a linha Usuario no primeiro login, este helper
// garante (busca ou cria) essa linha sempre que algo do módulo de educação
// financeira precisar do usuário logado.
export const getOrCreateUsuarioAtual = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const usuarioExistente = await db.usuario.findUnique({
    where: { clerkId: userId },
  });
  if (usuarioExistente) {
    return usuarioExistente;
  }

  const user = await currentUser();
  const nomeUsuario =
    user?.fullName ?? user?.firstName ?? user?.username ?? null;
  const emailUsuario = user?.primaryEmailAddress?.emailAddress ?? null;
  const imgUsuario = user?.imageUrl ?? null;

  try {
    return await db.usuario.create({
      data: {
        clerkId: userId,
        nomeUsuario,
        emailUsuario,
        imgUsuario,
      },
    });
  } catch {
    // Corrida rara: outra requisição criou a linha entre o findUnique e o
    // create (ex.: duas abas abertas ao mesmo tempo). Nesse caso só busca
    // de novo — a linha certamente existe agora.
    const usuario = await db.usuario.findUnique({ where: { clerkId: userId } });
    if (!usuario) {
      throw new Error("Não foi possível obter o usuário atual");
    }
    return usuario;
  }
};
