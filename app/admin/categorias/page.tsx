import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import CategoriasManager from "./_components/CategoriasManager";

const CategoriasPage = async () => {
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
