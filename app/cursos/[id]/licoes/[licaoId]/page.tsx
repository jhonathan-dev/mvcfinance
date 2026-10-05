import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/_components/navbar";
import { getLicaoDetalhe } from "@/app/_data/get-licao-detalhe";
import LicaoView from "./_components/LicaoView";

interface LicaoPageProps {
  params: { id: string; licaoId: string };
}

const LicaoPage = async ({ params }: LicaoPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

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
    <>
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6">
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
      </div>
    </>
  );
};

export default LicaoPage;
