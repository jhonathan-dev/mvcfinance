import Image from "next/image";
import { Card } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { Badge } from "@/app/_components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import type { ConquistasComProgresso } from "@/app/_data/get-conquistas-com-progresso";

interface ConquistasListaProps {
  conquistas: ConquistasComProgresso["conquistas"];
}

const ConquistasLista = ({ conquistas }: ConquistasListaProps) => {
  if (conquistas.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhuma conquista cadastrada no momento.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {conquistas.map((conquista) => {
        const imagem = conquista.desbloqueada
          ? conquista.imgConquistaDesb
          : conquista.imgConquistaBloq;

        return (
          <Card
            key={conquista.id}
            className={`space-y-3 p-4 ${conquista.desbloqueada ? "" : "opacity-80"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                  conquista.desbloqueada ? "bg-yellow-100" : "bg-secondary"
                }`}
              >
                {imagem ? (
                  <Image
                    src={imagem}
                    alt={conquista.titulo}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-cover"
                    unoptimized
                  />
                ) : conquista.desbloqueada ? (
                  <Trophy className="h-6 w-6 text-yellow-600" />
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{conquista.titulo}</p>
                {conquista.preRequisito && (
                  <p className="truncate text-xs text-muted-foreground">
                    {conquista.preRequisito}
                  </p>
                )}
              </div>
              {conquista.desbloqueada && (
                <Badge className="shrink-0 bg-yellow-600 hover:bg-yellow-600/90">
                  Desbloqueada
                </Badge>
              )}
            </div>

            {!conquista.desbloqueada && (
              <div className="space-y-1">
                <Progress value={conquista.percentual} />
                <span className="text-xs text-muted-foreground">
                  {conquista.percentual}% · precisa de {conquista.qtdXpMinimo}{" "}
                  XP
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ConquistasLista;
