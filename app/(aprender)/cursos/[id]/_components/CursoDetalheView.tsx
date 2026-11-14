"use client";

import Link from "next/link";
import { Card } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Progress } from "@/app/_components/ui/progress";
import { Button } from "@/app/_components/ui/button";
import {
  CheckCircle2,
  Circle,
  Lock,
  HelpCircle,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import type {
  Curso,
  Modulo,
  Licao,
  Questionario,
  ProgressoUsuarioQuestionario,
} from "@prisma/client";

type LicaoComProgresso = Licao & { concluida: boolean };
type ModuloComLicoes = Modulo & { licoes: LicaoComProgresso[] };
type CursoCompleto = Curso & {
  questionario: Questionario | null;
  modulos: ModuloComLicoes[];
  qtdLicoes: number;
  duracaoTotal: number;
};

interface CursoDetalheViewProps {
  curso: CursoCompleto;
  progressoQuestionario: ProgressoUsuarioQuestionario | null;
  percentualConcluido: number;
  proximaLicaoId: string | null;
}

const CursoDetalheView = ({
  curso,
  progressoQuestionario,
  percentualConcluido,
  proximaLicaoId,
}: CursoDetalheViewProps) => {
  const todasLicoesConcluidas = curso.modulos
    .flatMap((m) => m.licoes)
    .every((l) => l.concluida);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/cursos"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para cursos
      </Link>

      <Card className="overflow-hidden">
        <div className="p-6" style={{ backgroundColor: curso.cor }}>
          <Badge variant="secondary" className="mb-2">
            {curso.nivelEnsino === "INICIANTE"
              ? "Iniciante"
              : curso.nivelEnsino === "INTERMEDIARIO"
                ? "Intermediário"
                : "Avançado"}
          </Badge>
          <h1 className="text-2xl font-bold text-white">{curso.titulo}</h1>
          <p className="mt-1 text-white/90">{curso.descricao}</p>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {curso.qtdLicoes} lição(ões) · {curso.duracaoTotal} min
            </span>
            <span className="font-medium">
              {percentualConcluido}% concluído
            </span>
          </div>
          <Progress value={percentualConcluido} />
          {proximaLicaoId && (
            <Button asChild className="mt-2 w-full">
              <Link href={`/cursos/${curso.id}/licoes/${proximaLicaoId}`}>
                {percentualConcluido > 0 ? "Continuar curso" : "Começar curso"}
              </Link>
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {curso.modulos.map((modulo) => (
          <Card key={modulo.id} className="p-4">
            <h2 className="mb-3 font-semibold">{modulo.titulo}</h2>
            <ul className="space-y-1">
              {modulo.licoes.map((licao) => (
                <li key={licao.id}>
                  <Link
                    href={`/cursos/${curso.id}/licoes/${licao.id}`}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-secondary/60"
                  >
                    {licao.concluida ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1">{licao.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      {licao.duracao} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {curso.questionario && (
        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            {!todasLicoesConcluidas ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : progressoQuestionario?.questionarioFeito ? (
              <Trophy className="h-5 w-5 text-yellow-600" />
            ) : (
              <HelpCircle className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium">Questionário final</p>
              <p className="text-sm text-muted-foreground">
                {progressoQuestionario?.questionarioFeito
                  ? `Concluído · ${progressoQuestionario.qtdAcertos} acerto(s)`
                  : !todasLicoesConcluidas
                    ? "Conclua todas as lições para liberar"
                    : "Teste o que você aprendeu"}
              </p>
            </div>
          </div>
          {todasLicoesConcluidas ? (
            <Button asChild>
              <Link href={`/cursos/${curso.id}/quiz`}>
                {progressoQuestionario?.questionarioFeito
                  ? "Refazer"
                  : "Fazer questionário"}
              </Link>
            </Button>
          ) : (
            <Button disabled>Fazer questionário</Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default CursoDetalheView;
