import { notFound } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import PageHeader from "@/app/admin/_components/PageHeader";
import ModulosManager from "./_components/ModulosManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

interface ModulosPageProps {
  params: { id: string };
}

const ModulosPage = async ({ params }: ModulosPageProps) => {
  await exigirAdminNaPagina();
  const curso = await db.curso.findUnique({ where: { id: params.id } });
  if (!curso) notFound();

  const modulos = await db.modulo.findMany({
    where: { cursoId: params.id },
    include: { licoesPorModulo: true },
    orderBy: { ordem: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={`Módulos — ${curso.titulo}`}
        description="Organize o conteúdo do curso em módulos"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Cursos", href: "/admin/cursos" },
          { label: curso.titulo },
        ]}
      />
      <ModulosManager modulos={modulos} cursoId={curso.id} />
    </div>
  );
};

export default ModulosPage;
