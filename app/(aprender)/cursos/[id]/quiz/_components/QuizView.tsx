"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { responderQuestionario } from "@/app/_actions/responder-questionario";

interface Alternativa {
  id: string;
  texto: string;
}
interface Questao {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
}
interface CorrecaoItem {
  questaoId: string;
  correta: boolean;
  alternativaCorretaId: string | null;
  explicacao: string | null;
}

interface QuizViewProps {
  cursoId: string;
  cursoTitulo: string;
  questionarioId: string;
  descricao: string;
  questoes: Questao[];
  tentativaAnterior: { qtdAcertos: number; aprovado: boolean } | null;
}

const QuizView = ({
  cursoId,
  cursoTitulo,
  questionarioId,
  descricao,
  questoes,
  tentativaAnterior,
}: QuizViewProps) => {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    qtdAcertos: number;
    totalQuestoes: number;
    aprovado: boolean;
    correcao: CorrecaoItem[];
    xpGanho: number;
    xpCurso: number;
    cursoConcluido: boolean;
    conquistasDesbloqueadas: { titulo: string }[];
  } | null>(null);

  const todasRespondidas = questoes.every((q) => respostas[q.id]);

  const enviar = async () => {
    setEnviando(true);
    try {
      const resposta = await responderQuestionario({
        cursoId,
        questionarioId,
        respostas: questoes.map((q) => ({
          questaoId: q.id,
          alternativaId: respostas[q.id],
        })),
      });
      setResultado(resposta);
      if (resposta.aprovado) {
        toast.success(
          resposta.xpGanho > 0
            ? `Aprovado! +${resposta.xpGanho} XP`
            : "Aprovado novamente!",
        );
        if (resposta.cursoConcluido) {
          toast.success(
            resposta.xpCurso > 0
              ? `🎉 Curso concluído! +${resposta.xpCurso} XP`
              : "🎉 Curso concluído!",
          );
        }
      } else {
        toast.error("Você não atingiu a pontuação mínima. Tente novamente!");
      }
      resposta.conquistasDesbloqueadas.forEach((c) =>
        toast(`Conquista desbloqueada: ${c.titulo}`, { icon: "🏆" }),
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar respostas");
    } finally {
      setEnviando(false);
    }
  };

  const refazer = () => {
    setRespostas({});
    setResultado(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/cursos/${cursoId}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o curso
      </Link>

      <div>
        <Badge variant="secondary" className="mb-2">
          {cursoTitulo}
        </Badge>
        <h1 className="text-2xl font-bold">Questionário</h1>
        <p className="text-muted-foreground">{descricao}</p>
        {tentativaAnterior && !resultado && (
          <p className="mt-2 text-sm text-muted-foreground">
            Última tentativa: {tentativaAnterior.qtdAcertos}/{questoes.length}{" "}
            acertos · {tentativaAnterior.aprovado ? "aprovado" : "não aprovado"}
          </p>
        )}
      </div>

      {resultado ? (
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Trophy
              className={`h-8 w-8 ${resultado.aprovado ? "text-yellow-600" : "text-muted-foreground"}`}
            />
            <div>
              <p className="text-lg font-semibold">
                {resultado.qtdAcertos}/{resultado.totalQuestoes} acertos
              </p>
              <p className="text-sm text-muted-foreground">
                {resultado.aprovado
                  ? "Você foi aprovado!"
                  : "Não foi dessa vez."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {questoes.map((questao, i) => {
              const c = resultado.correcao.find(
                (r) => r.questaoId === questao.id,
              );
              return (
                <div key={questao.id} className="rounded-md border p-3">
                  <div className="flex items-start gap-2">
                    {c?.correta ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {i + 1}. {questao.enunciado}
                      </p>
                      {!c?.correta && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Resposta correta:{" "}
                          {
                            questao.alternativas.find(
                              (a) => a.id === c?.alternativaCorretaId,
                            )?.texto
                          }
                        </p>
                      )}
                      {c?.explicacao && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.explicacao}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={refazer}>
              Refazer questionário
            </Button>
            <Button asChild>
              <Link href={`/cursos/${cursoId}`}>Voltar ao curso</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questoes.map((questao, i) => (
            <Card key={questao.id} className="space-y-3 p-4">
              <p className="font-medium">
                {i + 1}. {questao.enunciado}
              </p>
              <div className="space-y-2">
                {questao.alternativas.map((alt) => (
                  <label
                    key={alt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
                      respostas[questao.id] === alt.id
                        ? "border-primary bg-secondary/60"
                        : "hover:bg-secondary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={questao.id}
                      className="h-4 w-4"
                      checked={respostas[questao.id] === alt.id}
                      onChange={() =>
                        setRespostas((prev) => ({
                          ...prev,
                          [questao.id]: alt.id,
                        }))
                      }
                    />
                    {alt.texto}
                  </label>
                ))}
              </div>
            </Card>
          ))}

          <Button
            className="w-full"
            onClick={enviar}
            disabled={!todasRespondidas || enviando}
          >
            Enviar respostas
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
