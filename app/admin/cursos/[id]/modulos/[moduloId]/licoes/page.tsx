import { notFound } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import PageHeader from "@/app/admin/_components/PageHeader";
import LicoesManager from "./_components/LicoesManager";

interface LicoesPageProps {
  params: { id: string; moduloId: string };
}

const LicoesPage = async ({ params }: LicoesPageProps) => {
  const [curso, modulo] = await Promise.all([
    db.curso.findUnique({ where: { id: params.id } }),
    db.modulo.findUnique({ where: { id: params.moduloId } }),
  ]);

  if (!curso || !modulo || modulo.cursoId !== curso.id) notFound();

  const licoes = await db.licao.findMany({
    where: { moduloId: params.moduloId },
    orderBy: { ordem: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={`Lições — ${modulo.titulo}`}
        description="Conteúdo que o usuário percorre dentro do módulo"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Cursos", href: "/admin/cursos" },
          { label: curso.titulo, href: `/admin/cursos/${curso.id}/modulos` },
          { label: modulo.titulo },
        ]}
      />
      <LicoesManager licoes={licoes} cursoId={curso.id} moduloId={modulo.id} />
    </div>
  );
};

export default LicoesPage;
