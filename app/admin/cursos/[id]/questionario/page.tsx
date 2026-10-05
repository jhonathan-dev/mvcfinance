import { notFound } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import PageHeader from "@/app/admin/_components/PageHeader";
import QuestionarioManager from "./_components/QuestionarioManager";

interface QuestionarioPageProps {
  params: { id: string };
}

const QuestionarioPage = async ({ params }: QuestionarioPageProps) => {
  const curso = await db.curso.findUnique({ where: { id: params.id } });
  if (!curso) notFound();

  const questionario = await db.questionario.findUnique({
    where: { cursoId: params.id },
    include: {
      questoes: {
        orderBy: { ordem: "asc" },
        include: { alternativas: { orderBy: { ordem: "asc" } } },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title={`Questionário — ${curso.titulo}`}
        description="Avaliação final do curso: perguntas de múltipla escolha"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Cursos", href: "/admin/cursos" },
          { label: curso.titulo, href: `/admin/cursos/${curso.id}/modulos` },
          { label: "Questionário" },
        ]}
      />
      <QuestionarioManager cursoId={curso.id} questionario={questionario} />
    </div>
  );
};

export default QuestionarioPage;
