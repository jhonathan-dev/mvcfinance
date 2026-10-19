"use client";

import { useState } from "react";
import Image from "next/image";
import { TipoOperacao } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
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
import { Plus, Pencil, Power, Trash2, Shapes } from "lucide-react";
import { toast } from "sonner";
import ConfirmDelete from "../../_components/ConfirmDelete";
import {
  upsertTipoOperacao,
  toggleTipoOperacao,
  deleteTipoOperacao,
} from "../../_actions/tipos-operacao";
import ImageUpload from "../../_components/ImageUpload";

type FormState = { tipo: string; icone: string | null; ativo: boolean };
const empty: FormState = { tipo: "", icone: null, ativo: true };

const TiposOperacaoManager = ({ tipos }: { tipos: TipoOperacao[] }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (t: TipoOperacao) => {
    setEditId(t.id);
    setForm({ tipo: t.tipo, icone: t.icone, ativo: t.ativo });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.tipo.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);
    try {
      await upsertTipoOperacao({ id: editId ?? undefined, ...form });
      toast.success(editId ? "Tipo atualizado" : "Tipo criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao salvar tipo de operação",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t: TipoOperacao) => {
    try {
      await toggleTipoOperacao(t.id);
      toast.success(t.ativo ? "Tipo inativado" : "Tipo ativado");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  const remove = async (t: TipoOperacao) => {
    try {
      const resultado = await deleteTipoOperacao(t.id);
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success("Tipo excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir tipo");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tipo de Operação
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ícone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum tipo de operação
                </TableCell>
              </TableRow>
            )}
            {tipos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                    {t.icone ? (
                      <Image
                        src={t.icone}
                        alt={t.tipo}
                        width={18}
                        height={18}
                        unoptimized
                      />
                    ) : (
                      <Shapes className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{t.tipo}</TableCell>
                <TableCell>
                  <Badge variant={t.ativo ? "default" : "secondary"}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggle(t)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir o tipo "${t.tipo}"? Se ele já foi usado em transações ou tem categorias, a exclusão é recusada e o melhor caminho é inativá-lo.`}
                    onConfirm={() => remove(t)}
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
            <DialogTitle>
              {editId ? "Editar Tipo de Operação" : "Novo Tipo de Operação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              value={form.icone}
              onChange={(url) => setForm({ ...form, icone: url })}
              pasta="tipos-operacao"
              label="Ícone"
            />
            <div className="space-y-1.5">
              <Label>
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Status ativo</span>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
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

export default TiposOperacaoManager;
