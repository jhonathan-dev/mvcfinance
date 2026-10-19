"use client";

import { useState } from "react";
import Link from "next/link";
import { Modulo, LicoesPorModulo } from "@prisma/client";
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
import { Plus, Pencil, Power, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  upsertModulo,
  deleteModulo,
  toggleModuloDesbloqueado,
} from "../../../../_actions/modulos";
import ConfirmDelete from "../../../../_components/ConfirmDelete";

type ModuloComContador = Modulo & { licoesPorModulo: LicoesPorModulo | null };
type FormState = { titulo: string; ordem: number; desbloqueado: boolean };

interface ModulosManagerProps {
  modulos: ModuloComContador[];
  cursoId: string;
}

const ModulosManager = ({ modulos, cursoId }: ModulosManagerProps) => {
  const empty: FormState = {
    titulo: "",
    ordem: modulos.length + 1,
    desbloqueado: false,
  };
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty, ordem: modulos.length + 1 });
    setOpen(true);
  };

  const openEdit = (m: ModuloComContador) => {
    setEditId(m.id);
    setForm({ titulo: m.titulo, ordem: m.ordem, desbloqueado: m.desbloqueado });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    setSaving(true);
    try {
      const resultado = await upsertModulo({
        id: editId ?? undefined,
        cursoId,
        ...form,
      });
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success(editId ? "Módulo atualizado" : "Módulo criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar módulo",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const resultado = await deleteModulo(id);
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success("Módulo excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir módulo");
    }
  };

  const toggle = async (m: ModuloComContador) => {
    try {
      const resultado = await toggleModuloDesbloqueado(m.id);
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success(
        m.desbloqueado ? "Módulo bloqueado" : "Módulo desbloqueado",
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Módulo
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Lições</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum módulo cadastrado
                </TableCell>
              </TableRow>
            )}
            {modulos.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.ordem}</TableCell>
                <TableCell className="font-medium">{m.titulo}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/cursos/${cursoId}/modulos/${m.id}/licoes`}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    {m.licoesPorModulo?.qtdLicoes ?? 0} lição(ões)
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={m.desbloqueado ? "default" : "secondary"}>
                    {m.desbloqueado ? "Desbloqueado" : "Bloqueado"}
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
                    description={`Excluir o módulo "${m.titulo}"? Isso também apaga todas as lições deste módulo.`}
                    onConfirm={() => remove(m.id)}
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
              {editId ? "Editar Módulo" : "Novo Módulo"}
            </DialogTitle>
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
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Módulo desbloqueado</span>
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

export default ModulosManager;
