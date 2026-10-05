import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/_components/navbar";
import { getCursoDetalhe } from "@/app/_data/get-curso-detalhe";
import CursoDetalheView from "./_components/CursoDetalheView";

interface CursoPageProps {
  params: { id: string };
}

const CursoPage = async ({ params }: CursoPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { curso, progressoQuestionario, calculo, proximaLicao } =
    await getCursoDetalhe(params.id);

  return (
    <>
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6">
        <CursoDetalheView
          curso={JSON.parse(JSON.stringify(curso))}
          progressoQuestionario={JSON.parse(
            JSON.stringify(progressoQuestionario),
          )}
          percentualConcluido={calculo?.percentualConcluido ?? 0}
          proximaLicaoId={proximaLicao?.id ?? null}
        />
      </div>
    </>
  );
};

export default CursoPage;
