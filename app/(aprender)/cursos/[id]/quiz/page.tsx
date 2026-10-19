import { getQuestionarioDetalhe } from "@/app/_data/get-questionario-detalhe";
import QuizView from "./_components/QuizView";

interface QuizPageProps {
  params: { id: string };
}

const QuizPage = async ({ params }: QuizPageProps) => {
  const { curso, questionario, questoes, progresso } =
    await getQuestionarioDetalhe(params.id);

  return (
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
  );
};

export default QuizPage;
