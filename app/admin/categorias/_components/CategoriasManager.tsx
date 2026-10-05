"use client";

import { useState } from "react";
import { Categoria, TipoOperacao } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
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
import { Plus, Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { upsertCategoria, toggleCategoria } from "../../_actions/categorias";

type CategoriaComTipo = Categoria & { tipoOperacao: TipoOperacao };
type FormState = { nome: string; tipoOperacaoId: string; ativo: boolean };

interface CategoriasManagerProps {
  categorias: CategoriaComTipo[];
  tipos: TipoOperacao[];
}

const CategoriasManager = ({ categorias, tipos }: CategoriasManagerProps) => {
  const empty: FormState = {
    nome: "",
    tipoOperacaoId: tipos[0]?.id ?? "",
    ativo: true,
  };
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: CategoriaComTipo) => {
    setEditId(c.id);
    setForm({ nome: c.nome, tipoOperacaoId: c.tipoOperacaoId, ativo: c.ativo });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);
    try {
      await upsertCategoria({ id: editId ?? undefined, ...form });
      toast.success(editId ? "Categoria atualizada" : "Categoria criada");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar categoria",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: CategoriaComTipo) => {
    try {
      await toggleCategoria(c.id);
      toast.success(c.ativo ? "Categoria inativada" : "Categoria ativada");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo de Operação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma categoria
                </TableCell>
              </TableRow>
            )}
            {categorias.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.tipoOperacao.tipo}</TableCell>
                <TableCell>
                  <Badge variant={c.ativo ? "default" : "secondary"}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
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
              {editId ? "Editar Categoria" : "Nova Categoria"}
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
              <Label>
                Tipo de Operação <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.tipoOperacaoId}
                onValueChange={(v) => setForm({ ...form, tipoOperacaoId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default CategoriasManager;
