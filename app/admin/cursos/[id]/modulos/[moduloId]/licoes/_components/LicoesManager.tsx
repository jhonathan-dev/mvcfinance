"use client";

import { useState } from "react";
import { Licao } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
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
import { Plus, Pencil, Power, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  upsertLicao,
  deleteLicao,
  toggleLicaoDesbloqueada,
} from "../../../../../../_actions/licoes";
import ConfirmDelete from "../../../../../../_components/ConfirmDelete";
import ImageUpload from "../../../../../../_components/ImageUpload";

type FormState = {
  titulo: string;
  conteudo: string;
  imagem: string | null;
  resumo: string;
  duracao: number;
  ordem: number;
  desbloqueado: boolean;
};

interface LicoesManagerProps {
  licoes: Licao[];
  cursoId: string;
  moduloId: string;
}

const LicoesManager = ({ licoes, cursoId, moduloId }: LicoesManagerProps) => {
  const empty: FormState = {
    titulo: "",
    conteudo: "",
    imagem: null,
    resumo: "",
    duracao: 5,
    ordem: licoes.length + 1,
    desbloqueado: false,
  };

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty, ordem: licoes.length + 1 });
    setOpen(true);
  };

  const openEdit = (l: Licao) => {
    setEditId(l.id);
    setForm({
      titulo: l.titulo,
      conteudo: l.conteudo,
      imagem: l.imagem,
      resumo: l.resumo,
      duracao: l.duracao,
      ordem: l.ordem,
      desbloqueado: l.desbloqueado,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    if (!form.resumo.trim()) return toast.error("Resumo é obrigatório");
    if (!form.conteudo.trim()) return toast.error("Conteúdo é obrigatório");

    setSaving(true);
    try {
      await upsertLicao({
        id: editId ?? undefined,
        cursoId,
        moduloId,
        ...form,
      });
      toast.success(editId ? "Lição atualizada" : "Lição criada");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar lição",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteLicao(id);
      toast.success("Lição excluída");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir lição");
    }
  };

  const toggle = async (l: Licao) => {
    try {
      await toggleLicaoDesbloqueada(l.id);
      toast.success(l.desbloqueado ? "Lição bloqueada" : "Lição desbloqueada");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Lição
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Resumo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma lição cadastrada
                </TableCell>
              </TableRow>
            )}
            {licoes.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.ordem}</TableCell>
                <TableCell className="font-medium">{l.titulo}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {l.resumo}
                </TableCell>
                <TableCell>{l.duracao} min</TableCell>
                <TableCell>
                  <Badge variant={l.desbloqueado ? "default" : "secondary"}>
                    {l.desbloqueado ? "Desbloqueada" : "Bloqueada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(l)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggle(l)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir a lição "${l.titulo}"?`}
                    onConfirm={() => remove(l.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editId ? "Editar Lição" : "Nova Lição"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              value={form.imagem}
              onChange={(url) => setForm({ ...form, imagem: url })}
              pasta="licoes"
              label="Imagem da lição"
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
                Resumo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={2}
                value={form.resumo}
                onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                placeholder="Aparece na listagem, antes de abrir a lição"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Conteúdo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={8}
                value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                placeholder="Texto completo exibido ao usuário na lição"
              />
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

            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Lição desbloqueada</span>
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

export default LicoesManager;
