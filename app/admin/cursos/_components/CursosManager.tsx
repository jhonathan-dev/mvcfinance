"use client";

import { useState } from "react";
import Link from "next/link";
import { Curso, TemaCurso, NivelEnsino } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Badge } from "@/app/_components/ui/badge";
import { Switch } from "@/app/_components/ui/switch";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
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
  BookOpen,
  ListTree,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  upsertCurso,
  deleteCurso,
  toggleCursoDesbloqueado,
} from "../../_actions/cursos";
import ConfirmDelete from "../../_components/ConfirmDelete";
import ImageUpload from "../../_components/ImageUpload";

type CursoComRelacoes = Curso & {
  temaCurso: TemaCurso;
  _count: { modulos: number; licoes: number };
};

type FormState = {
  titulo: string;
  descricao: string;
  imagem: string | null;
  duracao: number;
  nivelEnsino: NivelEnsino;
  cor: string;
  desbloqueado: boolean;
  ordem: number;
  temaCursoId: string;
};

const NIVEL_LABELS: Record<NivelEnsino, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

interface CursosManagerProps {
  cursos: CursoComRelacoes[];
  temas: TemaCurso[];
}

const CursosManager = ({ cursos, temas }: CursosManagerProps) => {
  const empty: FormState = {
    titulo: "",
    descricao: "",
    imagem: null,
    duracao: 30,
    nivelEnsino: "INICIANTE",
    cor: "#050E48",
    desbloqueado: false,
    ordem: cursos.length + 1,
    temaCursoId: temas[0]?.id ?? "",
  };

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty, ordem: cursos.length + 1 });
    setOpen(true);
  };

  const openEdit = (c: CursoComRelacoes) => {
    setEditId(c.id);
    setForm({
      titulo: c.titulo,
      descricao: c.descricao,
      imagem: c.imagem,
      duracao: c.duracao,
      nivelEnsino: c.nivelEnsino,
      cor: c.cor,
      desbloqueado: c.desbloqueado,
      ordem: c.ordem,
      temaCursoId: c.temaCursoId,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    if (!form.descricao.trim()) return toast.error("Descrição é obrigatória");
    if (!form.temaCursoId) return toast.error("Selecione um tema");

    setSaving(true);
    try {
      await upsertCurso({ id: editId ?? undefined, ...form });
      toast.success(editId ? "Curso atualizado" : "Curso criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar curso",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCurso(id);
      toast.success("Curso excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir curso");
    }
  };

  const toggle = async (c: CursoComRelacoes) => {
    try {
      await toggleCursoDesbloqueado(c.id);
      toast.success(c.desbloqueado ? "Curso bloqueado" : "Curso desbloqueado");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Curso
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cursos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum curso cadastrado
                </TableCell>
              </TableRow>
            )}
            {cursos.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: c.cor }}
                    />
                    {c.titulo}
                  </div>
                </TableCell>
                <TableCell>{c.temaCurso.titulo}</TableCell>
                <TableCell>{NIVEL_LABELS[c.nivelEnsino]}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/cursos/${c.id}/modulos`}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ListTree className="h-3.5 w-3.5" />
                    {c._count.modulos} módulo(s) · {c._count.licoes} lição(ões)
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={c.desbloqueado ? "default" : "secondary"}>
                    {c.desbloqueado ? "Desbloqueado" : "Bloqueado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Questionário"
                  >
                    <Link href={`/admin/cursos/${c.id}/questionario`}>
                      <HelpCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggle(c)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir o curso "${c.titulo}"? Isso também apaga todos os módulos, lições e o questionário vinculados a ele.`}
                    onConfirm={() => remove(c.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {editId ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              value={form.imagem}
              onChange={(url) => setForm({ ...form, imagem: url })}
              pasta="cursos"
              label="Imagem do curso"
            />

            <div className="space-y-1.5">
              <Label>
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Tema <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.temaCursoId}
                onValueChange={(v) => setForm({ ...form, temaCursoId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {temas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Nível de Ensino</Label>
              <Select
                value={form.nivelEnsino}
                onValueChange={(v) =>
                  setForm({ ...form, nivelEnsino: v as NivelEnsino })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NIVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.duracao}
                  onChange={(e) =>
                    setForm({ ...form, duracao: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.ordem}
                  onChange={(e) =>
                    setForm({ ...form, ordem: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cor do curso</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.cor}
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-md border"
                />
                <Input
                  value={form.cor}
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Curso desbloqueado</span>
              <Switch
                checked={form.desbloqueado}
                onCheckedChange={(v) => setForm({ ...form, desbloqueado: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CursosManager;
