import Link from "next/link";
import Image from "next/image";
import { getPainelAprender } from "@/app/_data/get-painel-aprender";
import { Card } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Progress } from "@/app/_components/ui/progress";
import {
  Zap,
  BookOpen,
  ArrowRight,
  Play,
  Check,
  Trophy,
  Lock,
  Clock,
} from "lucide-react";

const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

const formatarDuracao = (minutos: number) => {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const AprenderPainelPage = async () => {
  const {
    usuario,
    totalLicoes,
    licoesConcluidas,
    cursoAtual,
    proximaLicao,
    cursosPrevia,
    conquistas,
  } = await getPainelAprender();

  const primeiroNome = usuario.nomeUsuario?.split(" ")[0] ?? "";
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;
  const conquistasPrevia = conquistas.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <div>
        <p className="text-sm text-muted-foreground">
          Bem-vindo de volta{primeiroNome ? `, ${primeiroNome}` : ""} 👋
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">
          Vamos cultivar sua{" "}
          <span className="text-primary">sabedoria financeira</span>
        </h1>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-start justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              XP total
            </p>
            <p className="mt-2 text-3xl font-bold">
              {usuario.totalXp.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-start justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lições concluídas
            </p>
            <p className="mt-2 text-3xl font-bold">{licoesConcluidas}</p>
            <p className="text-sm text-muted-foreground">de {totalLicoes}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Continuar aprendendo */}
      {cursoAtual && (
        <div
          className="rounded-2xl p-6 text-white"
          style={{ backgroundColor: cursoAtual.cor }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
                Continuar aprendendo
              </span>
              <h2 className="text-2xl font-bold">{cursoAtual.titulo}</h2>
              {proximaLicao ? (
                <p className="text-white/85">
                  Próxima: {proximaLicao.titulo} · {proximaLicao.duracao} min
                </p>
              ) : (
                <p className="text-white/85">
                  Todas as lições concluídas — falta só o questionário.
                </p>
              )}
            </div>
            <Button
              asChild
              variant="secondary"
              className="shrink-0 rounded-full"
            >
              <Link
                href={
                  proximaLicao
                    ? `/cursos/${cursoAtual.id}/licoes/${proximaLicao.id}`
                    : `/cursos/${cursoAtual.id}`
                }
              >
                {cursoAtual.iniciado ? "Retomar" : "Começar"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-5 space-y-1.5">
            <p className="text-sm font-medium">
              {cursoAtual.percentualConcluido}% concluído
            </p>
            <Progress
              value={cursoAtual.percentualConcluido}
              className="h-2 bg-white/25 [&>div]:bg-white"
            />
          </div>
        </div>
      )}

      {/* Prévia de conquistas */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Suas conquistas</h2>
            <p className="text-sm text-muted-foreground">
              {desbloqueadas} de {conquistas.length} desbloqueadas
            </p>
          </div>
          <Link
            href="/conquistas"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        {conquistasPrevia.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conquista cadastrada ainda.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {conquistasPrevia.map((c) => {
              const imagem = c.desbloqueada
                ? c.imgConquistaDesb
                : c.imgConquistaBloq;
              return (
                <Card
                  key={c.id}
                  className={`flex items-center gap-3 p-4 ${c.desbloqueada ? "" : "opacity-75"}`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                      c.desbloqueada ? "bg-yellow-100" : "bg-secondary"
                    }`}
                  >
                    {imagem ? (
                      <Image
                        src={imagem}
                        alt={c.titulo}
                        width={44}
                        height={44}
                        className="h-11 w-11 object-cover"
                        unoptimized
                      />
                    ) : c.desbloqueada ? (
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {c.titulo}
                      </p>
                      {c.desbloqueada && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <Progress value={c.percentual} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {c.desbloqueada
                        ? `${c.qtdXpMinimo.toLocaleString("pt-BR")} XP`
                        : `${usuario.totalXp.toLocaleString("pt-BR")} / ${c.qtdXpMinimo.toLocaleString("pt-BR")} XP`}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Prévia de cursos */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Seus cursos</h2>
            <p className="text-sm text-muted-foreground">
              Continue de onde parou
            </p>
          </div>
          <Link
            href="/cursos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>
        {cursosPrevia.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum curso disponível no momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cursosPrevia.map((curso) => (
              <Card key={curso.id} className="overflow-hidden">
                <div
                  className="relative flex h-28 items-end justify-between p-3"
                  style={{ backgroundColor: curso.cor }}
                >
                  {curso.imagem && (
                    <Image
                      src={curso.imagem}
                      alt={curso.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <span className="relative rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {NIVEL_LABELS[curso.nivelEnsino] ?? curso.nivelEnsino}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold">{curso.titulo}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {curso.descricao}
                    </p>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatarDuracao(curso.duracaoTotal || curso.duracao)}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span className="font-medium text-foreground">
                        {curso.percentualConcluido}%
                      </span>
                    </div>
                    <Progress
                      value={curso.percentualConcluido}
                      className="h-1.5"
                    />
                  </div>
                  <Button asChild className="w-full rounded-full">
                    <Link href={`/cursos/${curso.id}`}>
                      <Play className="h-4 w-4" />
                      {curso.iniciado ? "Continuar" : "Começar curso"}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AprenderPainelPage;
