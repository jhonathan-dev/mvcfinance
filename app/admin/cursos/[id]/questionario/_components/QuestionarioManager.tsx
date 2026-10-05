"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Badge } from "@/app/_components/ui/badge";
import { Switch } from "@/app/_components/ui/switch";
import { Label } from "@/app/_components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import {
  Plus,
  Pencil,
  Power,
  Trash2,
  HelpCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { upsertQuestionario } from "../../../../_actions/questionario";
import {
  upsertQuestao,
  deleteQuestao,
  toggleQuestaoAtiva,
} from "../../../../_actions/questoes";
import ConfirmDelete from "../../../../_components/ConfirmDelete";
import ImageUpload from "../../../../_components/ImageUpload";

interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
  explicacao: string | null;
}

interface Questao {
  id: string;
  enunciado: string;
  ativa: boolean;
  ordem: number;
  alternativas: Alternativa[];
}

interface Questionario {
  id: string;
  descricao: string;
  imagem: string | null;
  qtdQuestoes: number;
  questoes: Questao[];
}

interface QuestionarioManagerProps {
  cursoId: string;
  questionario: Questionario | null;
}

type AlternativaForm = { id?: string; texto: string; explicacao: string };

const QuestionarioManager = ({
  cursoId,
  questionario,
}: QuestionarioManagerProps) => {
  // --- Formulário do Questionário (descrição geral) ---
  const [descricao, setDescricao] = useState(questionario?.descricao ?? "");
  const [imagem, setImagem] = useState<string | null>(
    questionario?.imagem ?? null,
  );
  const [qtdQuestoes, setQtdQuestoes] = useState(
    questionario?.qtdQuestoes ?? 5,
  );
  const [savingQuestionario, setSavingQuestionario] = useState(false);

  const submitQuestionario = async () => {
    if (!descricao.trim()) return toast.error("Descrição é obrigatória");
    setSavingQuestionario(true);
    try {
      await upsertQuestionario({
        id: questionario?.id,
        cursoId,
        descricao,
        imagem,
        qtdQuestoes,
      });
      toast.success(
        questionario ? "Questionário atualizado" : "Questionário criado",
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar questionário",
      );
    } finally {
      setSavingQuestionario(false);
    }
  };

  // --- Dialog de Questão (com alternativas) ---
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [enunciado, setEnunciado] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [ordem, setOrdem] = useState(1);
  const [alternativas, setAlternativas] = useState<AlternativaForm[]>([]);
  const [corretaIndex, setCorretaIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const openNewQuestao = () => {
    setEditId(null);
    setEnunciado("");
    setAtiva(true);
    setOrdem((questionario?.questoes.length ?? 0) + 1);
    setAlternativas([
      { texto: "", explicacao: "" },
      { texto: "", explicacao: "" },
    ]);
    setCorretaIndex(0);
    setOpen(true);
  };

  const openEditQuestao = (q: Questao) => {
    setEditId(q.id);
    setEnunciado(q.enunciado);
    setAtiva(q.ativa);
    setOrdem(q.ordem);
    setAlternativas(
      q.alternativas.map((a) => ({
        id: a.id,
        texto: a.texto,
        explicacao: a.explicacao ?? "",
      })),
    );
    setCorretaIndex(q.alternativas.findIndex((a) => a.correta));
    setOpen(true);
  };

  const addAlternativa = () => {
    setAlternativas([...alternativas, { texto: "", explicacao: "" }]);
  };

  const updateAlternativa = (
    index: number,
    patch: Partial<AlternativaForm>,
  ) => {
    const novas = [...alternativas];
    novas[index] = { ...novas[index], ...patch };
    setAlternativas(novas);
  };

  const removeAlternativa = (index: number) => {
    setAlternativas(alternativas.filter((_, i) => i !== index));
    if (corretaIndex === index) setCorretaIndex(null);
    else if (corretaIndex !== null && corretaIndex > index)
      setCorretaIndex(corretaIndex - 1);
  };

  const submitQuestao = async () => {
    if (!questionario)
      return toast.error("Salve o questionário antes de adicionar questões");
    if (!enunciado.trim()) return toast.error("Enunciado é obrigatório");
    if (alternativas.length < 2)
      return toast.error("Cadastre pelo menos 2 alternativas");
    if (alternativas.some((a) => !a.texto.trim())) {
      return toast.error("Toda alternativa precisa de um texto");
    }
    if (corretaIndex === null)
      return toast.error("Marque qual alternativa é a correta");

    setSaving(true);
    try {
      await upsertQuestao({
        id: editId ?? undefined,
        enunciado,
        ativa,
        ordem,
        questionarioId: questionario.id,
        alternativas: alternativas.map((a, i) => ({
          id: a.id,
          texto: a.texto,
          correta: i === corretaIndex,
          explicacao: a.explicacao || null,
        })),
      });
      toast.success(editId ? "Questão atualizada" : "Questão criada");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar questão",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeQuestao = async (id: string) => {
    try {
      await deleteQuestao(id, cursoId);
      toast.success("Questão excluída");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir questão");
    }
  };

  const toggleQuestao = async (q: Questao) => {
    try {
      await toggleQuestaoAtiva(q.id, cursoId);
      toast.success(q.ativa ? "Questão inativada" : "Questão ativada");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Questionário</CardTitle>
          <CardDescription>
            {questionario
              ? "Informações gerais exibidas antes do usuário iniciar a avaliação."
              : "Ainda não existe um questionário para este curso — preencha e salve para criar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            value={imagem}
            onChange={setImagem}
            pasta="questionarios"
            label="Imagem"
          />
          <div className="space-y-1.5">
            <Label>
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="max-w-xs space-y-1.5">
            <Label>Quantidade de questões (meta)</Label>
            <Input
              type="number"
              min={1}
              value={qtdQuestoes}
              onChange={(e) => setQtdQuestoes(Number(e.target.value))}
            />
          </div>
          <Button onClick={submitQuestionario} disabled={savingQuestionario}>
            Salvar
          </Button>
        </CardContent>
      </Card>

      {questionario && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questões</h2>
            <Button onClick={openNewQuestao}>
              <Plus className="mr-2 h-4 w-4" /> Nova Questão
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Enunciado</TableHead>
                  <TableHead>Alternativas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionario.questoes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma questão cadastrada
                    </TableCell>
                  </TableRow>
                )}
                {questionario.questoes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.ordem}</TableCell>
                    <TableCell className="max-w-sm truncate font-medium">
                      {q.enunciado}
                    </TableCell>
                    <TableCell>{q.alternativas.length}</TableCell>
                    <TableCell>
                      <Badge variant={q.ativa ? "default" : "secondary"}>
                        {q.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditQuestao(q)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleQuestao(q)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <ConfirmDelete
                        description="Excluir esta questão e suas alternativas?"
                        onConfirm={() => removeQuestao(q.id)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDelete>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {editId ? "Editar Questão" : "Nova Questão"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Enunciado <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={2}
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min={1}
                  value={ordem}
                  onChange={(e) => setOrdem(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end justify-between rounded-md border p-2.5">
                <span className="text-sm font-medium">Ativa</span>
                <Switch checked={ativa} onCheckedChange={setAtiva} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Alternativas <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAlternativa}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Marque com <CheckCircle2 className="inline h-3 w-3" /> qual
                alternativa é a correta.
              </p>
              <div className="space-y-2">
                {alternativas.map((a, i) => (
                  <div key={i} className="space-y-1.5 rounded-md border p-2.5">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setCorretaIndex(i)}
                        className="mt-2 shrink-0"
                        title="Marcar como correta"
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            corretaIndex === i
                              ? "text-emerald-600"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                      <Input
                        placeholder={`Alternativa ${i + 1}`}
                        value={a.texto}
                        onChange={(e) =>
                          updateAlternativa(i, { texto: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        onClick={() => removeAlternativa(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      className="ml-7"
                      placeholder="Explicação exibida após responder (opcional)"
                      value={a.explicacao}
                      onChange={(e) =>
                        updateAlternativa(i, { explicacao: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitQuestao} disabled={saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionarioManager;
