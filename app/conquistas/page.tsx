import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import { getConquistasComProgresso } from "../_data/get-conquistas-com-progresso";
import ConquistasLista from "./_components/ConquistasLista";

const ConquistasPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { usuario, conquistas } = await getConquistasComProgresso();

  return (
    <>
      <Navbar />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div>
          <h1 className="text-2xl font-bold">Conquistas</h1>
          <p className="text-muted-foreground">
            Você já acumulou{" "}
            <span className="font-semibold">{usuario.totalXp} XP</span>.
            Continue estudando para desbloquear todas as conquistas.
          </p>
        </div>
        <ConquistasLista conquistas={conquistas} />
      </div>
    </>
  );
};

export default ConquistasPage;
