import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/_components/navbar";
import { getQuestionarioDetalhe } from "@/app/_data/get-questionario-detalhe";
import QuizView from "./_components/QuizView";

interface QuizPageProps {
  params: { id: string };
}

const QuizPage = async ({ params }: QuizPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { curso, questionario, questoes, progresso } =
    await getQuestionarioDetalhe(params.id);

  return (
    <>
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6">
        <QuizView
          cursoId={curso.id}
          cursoTitulo={curso.titulo}
          questionarioId={questionario.id}
          descricao={questionario.descricao}
          questoes={questoes}
          tentativaAnterior={
            progresso
              ? {
                  qtdAcertos: progresso.qtdAcertos,
                  aprovado: progresso.questionarioFeito,
                }
              : null
          }
        />
      </div>
    </>
  );
};

export default QuizPage;
