"use client";

import { useState } from "react";
import Image from "next/image";
import { MetodoPagamento } from "@prisma/client";
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
import { Plus, Pencil, Power, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import ConfirmDelete from "../../_components/ConfirmDelete";
import {
  upsertMetodoPagamento,
  toggleMetodoPagamento,
  deleteMetodoPagamento,
} from "../../_actions/metodos-pagamento";

type FormState = { nome: string; icone: string; ativo: boolean };
const empty: FormState = { nome: "", icone: "", ativo: true };

const MetodosManager = ({ metodos }: { metodos: MetodoPagamento[] }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (m: MetodoPagamento) => {
    setEditId(m.id);
    setForm({ nome: m.nome, icone: m.icone ?? "", ativo: m.ativo });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);
    try {
      await upsertMetodoPagamento({
        id: editId ?? undefined,
        nome: form.nome,
        icone: form.icone || null,
        ativo: form.ativo,
      });
      toast.success(editId ? "Método atualizado" : "Método criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar método",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (m: MetodoPagamento) => {
    try {
      await toggleMetodoPagamento(m.id);
      toast.success(m.ativo ? "Método inativado" : "Método ativado");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  const remove = async (m: MetodoPagamento) => {
    try {
      const resultado = await deleteMetodoPagamento(m.id);
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success("Método excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir método");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Método
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ícone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metodos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum método
                </TableCell>
              </TableRow>
            )}
            {metodos.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                    {m.icone ? (
                      <Image
                        src={m.icone}
                        alt={m.nome}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    ) : (
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{m.nome}</TableCell>
                <TableCell>
                  <Badge variant={m.ativo ? "default" : "secondary"}>
                    {m.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(m)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggle(m)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir o método "${m.nome}"? Se ele já foi usado em transações, a exclusão é recusada e o melhor caminho é inativá-lo.`}
                    onConfirm={() => remove(m)}
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
              {editId ? "Editar Método" : "Novo Método"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ícone (caminho do arquivo em /public, ex: /pix.svg)</Label>
              <Input
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value })}
                placeholder="/pix.svg"
              />
              <p className="text-xs text-muted-foreground">
                Upload de arquivo ainda não implementado — por enquanto, suba o
                SVG/PNG em <code>public/</code> e informe o caminho aqui.
              </p>
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

export default MetodosManager;
