import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import ConquistasManager from "./_components/ConquistasManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const ConquistasPage = async () => {
  await exigirAdminNaPagina();
  const conquistas = await db.conquista.findMany({
    orderBy: { qtdXpMinimo: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Conquistas"
        description="Medalhas desbloqueadas pelo usuário ao acumular XP"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Conquistas" }]}
      />
      <ConquistasManager conquistas={conquistas} />
    </div>
  );
};

export default ConquistasPage;
