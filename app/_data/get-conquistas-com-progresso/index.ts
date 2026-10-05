import { db } from "@/app/_lib/prisma";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

export const getConquistasComProgresso = async () => {
  const usuario = await getOrCreateUsuarioAtual();

  const [conquistas, desbloqueadas] = await Promise.all([
    db.conquista.findMany({ orderBy: { qtdXpMinimo: "asc" } }),
    db.progressoUsuarioConquista.findMany({ where: { usuarioId: usuario.id } }),
  ]);

  const desbloqueadaPorId = new Map(
    desbloqueadas.map((d) => [d.conquistaId, d.desbloqueadaEm]),
  );

  const conquistasComProgresso = conquistas.map((conquista) => {
    const desbloqueadaEm = desbloqueadaPorId.get(conquista.id) ?? null;
    const percentual =
      conquista.qtdXpMinimo > 0
        ? Math.min(
            100,
            Math.round((usuario.totalXp / conquista.qtdXpMinimo) * 100),
          )
        : 100;
    return {
      ...conquista,
      desbloqueada: !!desbloqueadaEm,
      desbloqueadaEm,
      percentual,
    };
  });

  return { usuario, conquistas: conquistasComProgresso };
};

export type ConquistasComProgresso = Awaited<
  ReturnType<typeof getConquistasComProgresso>
>;
