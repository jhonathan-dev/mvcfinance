import { getCursoDetalhe } from "@/app/_data/get-curso-detalhe";
import CursoDetalheView from "./_components/CursoDetalheView";

interface CursoPageProps {
  params: { id: string };
}

const CursoPage = async ({ params }: CursoPageProps) => {
  const { curso, progressoQuestionario, calculo, proximaLicao } =
    await getCursoDetalhe(params.id);

  return (
    <CursoDetalheView
      curso={JSON.parse(JSON.stringify(curso))}
      progressoQuestionario={JSON.parse(JSON.stringify(progressoQuestionario))}
      percentualConcluido={calculo?.percentualConcluido ?? 0}
      proximaLicaoId={proximaLicao?.id ?? null}
    />
  );
};

export default CursoPage;
