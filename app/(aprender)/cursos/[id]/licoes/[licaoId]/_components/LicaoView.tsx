"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { Licao } from "@prisma/client";
import { concluirLicao } from "@/app/_actions/concluir-licao";
import { salvarAnotacaoLicao } from "@/app/_actions/salvar-anotacao-licao";

interface LicaoViewProps {
  cursoId: string;
  licao: Licao;
  concluidaInicial: boolean;
  anotacaoInicial: string;
  licaoAnteriorId: string | null;
  proximaLicaoId: string | null;
  ultimaLicaoDoCurso: boolean;
  temQuestionario: boolean;
}

const LicaoView = ({
  cursoId,
  licao,
  concluidaInicial,
  anotacaoInicial,
  licaoAnteriorId,
  proximaLicaoId,
  ultimaLicaoDoCurso,
  temQuestionario,
}: LicaoViewProps) => {
  const [concluida, setConcluida] = useState(concluidaInicial);
  const [concluindo, setConcluindo] = useState(false);
  const [anotacao, setAnotacao] = useState(anotacaoInicial);
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false);

  const marcarConcluida = async () => {
    setConcluindo(true);
    try {
      const { xpGanho, xpCurso, cursoConcluido, conquistasDesbloqueadas } =
        await concluirLicao(licao.id);
      setConcluida(true);
      if (xpGanho > 0) {
        toast.success(`Lição concluída! +${xpGanho} XP`);
      } else {
        toast.success("Lição já estava concluída");
      }
      if (cursoConcluido) {
        toast.success(
          xpCurso > 0
            ? `🎉 Curso concluído! +${xpCurso} XP`
            : "🎉 Curso concluído!",
        );
      }
      conquistasDesbloqueadas.forEach((c) =>
        toast(`Conquista desbloqueada: ${c.titulo}`, { icon: "🏆" }),
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao concluir lição");
    } finally {
      setConcluindo(false);
    }
  };

  const salvarAnotacao = async () => {
    setSalvandoAnotacao(true);
    try {
      await salvarAnotacaoLicao(licao.id, anotacao);
      toast.success("Anotação salva");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar anotação");
    } finally {
      setSalvandoAnotacao(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/cursos/${cursoId}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o curso
      </Link>

      <Card className="overflow-hidden">
        {licao.imagem && (
          <div className="relative h-40 w-full">
            <Image
              src={licao.imagem}
              alt={licao.titulo}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">{licao.titulo}</h1>
            <p className="mt-1 text-muted-foreground">{licao.resumo}</p>
          </div>

          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: licao.conteudo }}
          />

          <div className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-2">
              {concluida ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Lição concluída</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    Marque como concluída para ganhar XP
                  </span>
                </>
              )}
            </div>
            <Button
              onClick={marcarConcluida}
              disabled={concluida || concluindo}
            >
              {concluida ? "Concluída" : "Concluir lição"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Minhas anotações</Label>
            <Textarea
              rows={4}
              placeholder="Escreva aqui o que você quer lembrar desta lição..."
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={salvarAnotacao}
                disabled={salvandoAnotacao}
              >
                Salvar anotação
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" asChild disabled={!licaoAnteriorId}>
          {licaoAnteriorId ? (
            <Link href={`/cursos/${cursoId}/licoes/${licaoAnteriorId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Link>
          ) : (
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </span>
          )}
        </Button>

        {proximaLicaoId ? (
          <Button asChild>
            <Link href={`/cursos/${cursoId}/licoes/${proximaLicaoId}`}>
              Próxima <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : ultimaLicaoDoCurso && temQuestionario ? (
          <Button asChild>
            <Link href={`/cursos/${cursoId}/quiz`}>
              Ir para o questionário <Trophy className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/cursos/${cursoId}`}>Voltar ao curso</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default LicaoView;
