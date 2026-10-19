import Link from "next/link";
import Image from "next/image";
import { Card } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Progress } from "@/app/_components/ui/progress";
import { Lock, Clock, BookOpen, Crown } from "lucide-react";
import type { CursosComProgresso } from "@/app/_data/get-cursos-com-progresso";
import type { AcessoCurso } from "@/app/_data/get-acesso-cursos";

const textoBloqueio = (acesso: AcessoCurso) => {
  switch (acesso.motivo) {
    case "premium":
      return "Exclusivo do plano Premium";
    case "anterior":
      return `Conclua "${acesso.cursoAnteriorTitulo}" para liberar`;
    default:
      return "Em breve";
  }
};

const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

const formatarDuracao = (minutos: number) => {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`;
};

interface CursosListaProps {
  temas: CursosComProgresso["temas"];
}

const CursosLista = ({ temas }: CursosListaProps) => {
  const algumCurso = temas.some((t) => t.cursos.length > 0);

  if (!algumCurso) {
    return (
      <p className="text-muted-foreground">
        Nenhum curso disponível no momento.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {temas
        .filter((tema) => tema.cursos.length > 0)
        .map((tema) => (
          <section key={tema.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{tema.titulo}</h2>
              <p className="text-sm text-muted-foreground">{tema.descricao}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tema.cursos.map((curso) => {
                const bloqueado = !curso.acesso.liberado;
                const motivoTexto = textoBloqueio(curso.acesso);
                const conteudo = (
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                    <div
                      className="relative flex h-28 items-center justify-center"
                      style={{ backgroundColor: curso.cor }}
                    >
                      {curso.imagem ? (
                        <Image
                          src={curso.imagem}
                          alt={curso.titulo}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-white/80" />
                      )}
                      {bloqueado && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="line-clamp-1 font-semibold">
                          {curso.titulo}
                        </h3>
                        <Badge variant="secondary" className="shrink-0">
                          {NIVEL_LABELS[curso.nivelEnsino] ?? curso.nivelEnsino}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {curso.descricao}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatarDuracao(curso.duracaoTotal || curso.duracao)}
                        </span>
                        <span>{curso.qtdLicoes} lição(ões)</span>
                      </div>
                      {bloqueado && (
                        <p className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                          {curso.acesso.motivo === "premium" ? (
                            <Crown className="h-3.5 w-3.5 text-yellow-600" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                          {motivoTexto}
                        </p>
                      )}
                      {!bloqueado && (
                        <div className="space-y-1">
                          <Progress value={curso.percentualConcluido} />
                          <span className="text-xs text-muted-foreground">
                            {curso.iniciado
                              ? `${curso.percentualConcluido}% concluído`
                              : "Não iniciado"}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                );

                if (curso.acesso.motivo === "premium") {
                  return (
                    <Link
                      key={curso.id}
                      href="/subscription"
                      className="opacity-90"
                    >
                      {conteudo}
                    </Link>
                  );
                }

                return bloqueado ? (
                  <div key={curso.id} className="cursor-not-allowed opacity-70">
                    {conteudo}
                  </div>
                ) : (
                  <Link key={curso.id} href={`/cursos/${curso.id}`}>
                    {conteudo}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
};

export default CursosLista;
