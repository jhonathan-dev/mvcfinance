import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import CategoriasManager from "./_components/CategoriasManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const CategoriasPage = async () => {
  await exigirAdminNaPagina();
  const [categorias, tipos] = await Promise.all([
    db.categoria.findMany({
      include: { tipoOperacao: true },
      orderBy: { nome: "asc" },
    }),
    db.tipoOperacao.findMany({ orderBy: { tipo: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Categorias"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categorias" }]}
      />
      <CategoriasManager categorias={categorias} tipos={tipos} />
    </div>
  );
};

export default CategoriasPage;
