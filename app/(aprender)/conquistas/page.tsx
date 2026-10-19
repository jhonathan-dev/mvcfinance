import { getConquistasComProgresso } from "@/app/_data/get-conquistas-com-progresso";
import ConquistasLista from "./_components/ConquistasLista";
import { Progress } from "@/app/_components/ui/progress";
import { Zap } from "lucide-react";

const ConquistasPage = async () => {
  const { usuario, conquistas } = await getConquistasComProgresso();

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;
  const percentual =
    conquistas.length > 0
      ? Math.round((desbloqueadas / conquistas.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Sala dos troféus</p>
        <h1 className="text-3xl font-bold">
          Suas <span className="text-primary">conquistas</span>
        </h1>
      </div>

      <div className="grid gap-6 rounded-xl bg-[#050E48] p-6 text-white md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Desbloqueadas
          </p>
          <p className="text-4xl font-bold">
            {desbloqueadas}
            <span className="text-xl text-white/60">/{conquistas.length}</span>
          </p>
          <Progress value={percentual} className="h-2 bg-white/20" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            XP total conquistado
          </p>
          <p className="flex items-center gap-2 text-4xl font-bold">
            <Zap className="h-7 w-7" />
            {usuario.totalXp.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <ConquistasLista conquistas={conquistas} />
    </div>
  );
};

export default ConquistasPage;
