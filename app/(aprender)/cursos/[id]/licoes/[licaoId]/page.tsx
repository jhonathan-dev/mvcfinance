import { getLicaoDetalhe } from "@/app/_data/get-licao-detalhe";
import LicaoView from "./_components/LicaoView";

interface LicaoPageProps {
  params: { id: string; licaoId: string };
}

const LicaoPage = async ({ params }: LicaoPageProps) => {
  const {
    curso,
    licao,
    concluida,
    anotacaoTexto,
    licaoAnterior,
    proximaLicao,
    ultimaLicaoDoCurso,
    temQuestionario,
  } = await getLicaoDetalhe(params.id, params.licaoId);

  return (
    <LicaoView
      cursoId={curso.id}
      licao={JSON.parse(JSON.stringify(licao))}
      concluidaInicial={concluida}
      anotacaoInicial={anotacaoTexto}
      licaoAnteriorId={licaoAnterior?.id ?? null}
      proximaLicaoId={proximaLicao?.id ?? null}
      ultimaLicaoDoCurso={ultimaLicaoDoCurso}
      temQuestionario={temQuestionario}
    />
  );
};

export default LicaoPage;
