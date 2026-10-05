import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import { getCursosComProgresso } from "../_data/get-cursos-com-progresso";
import CursosLista from "./_components/CursosLista";

const CursosPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { temas } = await getCursosComProgresso();

  return (
    <>
      <Navbar />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <div>
          <h1 className="text-2xl font-bold">Educação Financeira</h1>
          <p className="text-muted-foreground">
            Aprenda no seu ritmo e ganhe XP concluindo cursos, lições e
            questionários.
          </p>
        </div>
        <CursosLista temas={temas} />
      </div>
    </>
  );
};

export default CursosPage;
