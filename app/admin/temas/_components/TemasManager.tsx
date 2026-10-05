"use client";

import { useState } from "react";
import { TemaCurso } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
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
import { Label } from "@/app/_components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { upsertTema, deleteTema } from "../../_actions/temas";
import ConfirmDelete from "../../_components/ConfirmDelete";

type FormState = { titulo: string; descricao: string; ordem: number };
const empty: FormState = { titulo: "", descricao: "", ordem: 1 };

const TemasManager = ({ temas }: { temas: TemaCurso[] }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty, ordem: temas.length + 1 });
    setOpen(true);
  };

  const openEdit = (t: TemaCurso) => {
    setEditId(t.id);
    setForm({ titulo: t.titulo, descricao: t.descricao, ordem: t.ordem });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    if (!form.descricao.trim()) return toast.error("Descrição é obrigatória");
    setSaving(true);
    try {
      await upsertTema({ id: editId ?? undefined, ...form });
      toast.success(editId ? "Tema atualizado" : "Tema criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar tema",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteTema({ id });
      toast.success("Tema excluído");
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao excluir. Verifique se não há cursos vinculados a este tema.",
      );
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tema
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-20">Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {temas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum tema cadastrado
                </TableCell>
              </TableRow>
            )}
            {temas.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.titulo}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {t.descricao}
                </TableCell>
                <TableCell>{t.ordem}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir o tema "${t.titulo}"?`}
                    onConfirm={() => remove(t.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Tema" : "Novo Tema"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={form.ordem}
                onChange={(e) =>
                  setForm({ ...form, ordem: Number(e.target.value) })
                }
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

export default TemasManager;
