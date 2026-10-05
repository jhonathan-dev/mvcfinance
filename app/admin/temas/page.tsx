import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import TemasManager from "./_components/TemasManager";

const TemasPage = async () => {
  const temas = await db.temaCurso.findMany({ orderBy: { ordem: "asc" } });

  return (
    <div>
      <PageHeader
        title="Temas de Curso"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Temas" }]}
      />
      <TemasManager temas={temas} />
    </div>
  );
};

export default TemasPage;
