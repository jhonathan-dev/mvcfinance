"use client";

import { useState } from "react";
import Image from "next/image";
import { Conquista } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
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
import { Plus, Pencil, Trash2, Trophy, Lock } from "lucide-react";
import { toast } from "sonner";
import { upsertConquista, deleteConquista } from "../../_actions/conquistas";
import ConfirmDelete from "../../_components/ConfirmDelete";
import ImageUpload from "../../_components/ImageUpload";

type FormState = {
  titulo: string;
  preRequisito: string;
  imgConquistaBloq: string | null;
  imgConquistaDesb: string | null;
  qtdXpMinimo: number;
};

const empty: FormState = {
  titulo: "",
  preRequisito: "",
  imgConquistaBloq: null,
  imgConquistaDesb: null,
  qtdXpMinimo: 0,
};

const ConquistasManager = ({ conquistas }: { conquistas: Conquista[] }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: Conquista) => {
    setEditId(c.id);
    setForm({
      titulo: c.titulo,
      preRequisito: c.preRequisito ?? "",
      imgConquistaBloq: c.imgConquistaBloq,
      imgConquistaDesb: c.imgConquistaDesb,
      qtdXpMinimo: c.qtdXpMinimo,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    setSaving(true);
    try {
      await upsertConquista({
        id: editId ?? undefined,
        titulo: form.titulo,
        preRequisito: form.preRequisito || null,
        imgConquistaBloq: form.imgConquistaBloq,
        imgConquistaDesb: form.imgConquistaDesb,
        qtdXpMinimo: form.qtdXpMinimo,
      });
      toast.success(editId ? "Conquista atualizada" : "Conquista criada");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar conquista",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteConquista(id);
      toast.success("Conquista excluída");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir conquista");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Conquista
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ícone</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Pré-requisito</TableHead>
              <TableHead>XP mínimo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conquistas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma conquista cadastrada
                </TableCell>
              </TableRow>
            )}
            {conquistas.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                    {c.imgConquistaDesb ? (
                      <Image
                        src={c.imgConquistaDesb}
                        alt={c.titulo}
                        width={20}
                        height={20}
                        unoptimized
                      />
                    ) : (
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{c.titulo}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.preRequisito || "—"}
                </TableCell>
                <TableCell>{c.qtdXpMinimo} XP</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir a conquista "${c.titulo}"?`}
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
              <Trophy className="h-5 w-5" />
              {editId ? "Editar Conquista" : "Nova Conquista"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Bloqueada
                </Label>
                <ImageUpload
                  value={form.imgConquistaBloq}
                  onChange={(url) =>
                    setForm({ ...form, imgConquistaBloq: url })
                  }
                  pasta="conquistas"
                  label="Imagem bloqueada"
                />
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="h-3 w-3" /> Desbloqueada
                </Label>
                <ImageUpload
                  value={form.imgConquistaDesb}
                  onChange={(url) =>
                    setForm({ ...form, imgConquistaDesb: url })
                  }
                  pasta="conquistas"
                  label="Imagem desbloqueada"
                />
              </div>
            </div>

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
              <Label>Pré-requisito (texto livre, opcional)</Label>
              <Input
                value={form.preRequisito}
                onChange={(e) =>
                  setForm({ ...form, preRequisito: e.target.value })
                }
                placeholder="Ex: Completar o curso de Fundamentos"
              />
            </div>

            <div className="space-y-1.5">
              <Label>XP mínimo para desbloquear</Label>
              <Input
                type="number"
                min={0}
                value={form.qtdXpMinimo}
                onChange={(e) =>
                  setForm({ ...form, qtdXpMinimo: Number(e.target.value) })
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

export default ConquistasManager;
