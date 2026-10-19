import { getCursosComProgresso } from "@/app/_data/get-cursos-com-progresso";
import CursosLista from "./_components/CursosLista";

const CursosPage = async () => {
  const { temas } = await getCursosComProgresso();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Biblioteca de aprendizado
        </p>
        <h1 className="text-3xl font-bold">
          Todos os <span className="text-primary">cursos</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aprenda no seu ritmo e ganhe XP concluindo cursos, lições e
          questionários.
        </p>
      </div>
      <CursosLista temas={temas} />
    </div>
  );
};

export default CursosPage;
