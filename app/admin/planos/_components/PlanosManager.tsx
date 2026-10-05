"use client";

import { useState } from "react";
import { Plano, BeneficioPlano } from "@prisma/client";
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
import { Plus, Pencil, Power, Trash2, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import {
  upsertPlano,
  deletePlano,
  togglePlanoAtivo,
} from "../../_actions/planos";
import ConfirmDelete from "../../_components/ConfirmDelete";

// valorMensal chega como string (Decimal serializado via JSON pelo Server Component)
type PlanoComBeneficios = Omit<Plano, "valorMensal"> & {
  valorMensal: string;
  beneficios: BeneficioPlano[];
};

type BeneficioForm = {
  id?: string;
  beneficio: string;
  limiteOperacoes: string;
};

type FormState = {
  titulo: string;
  descricao: string;
  valorMensal: string;
  stripePriceId: string;
  ordem: number;
  ativo: boolean;
  beneficios: BeneficioForm[];
};

const empty: FormState = {
  titulo: "",
  descricao: "",
  valorMensal: "",
  stripePriceId: "",
  ordem: 1,
  ativo: true,
  beneficios: [],
};

const PlanosManager = ({ planos }: { planos: PlanoComBeneficios[] }) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditId(null);
    setForm({ ...empty, ordem: planos.length + 1 });
    setOpen(true);
  };

  const openEdit = (p: PlanoComBeneficios) => {
    setEditId(p.id);
    setForm({
      titulo: p.titulo,
      descricao: p.descricao ?? "",
      valorMensal: p.valorMensal,
      stripePriceId: p.stripePriceId ?? "",
      ordem: p.ordem,
      ativo: p.ativo,
      beneficios: p.beneficios.map((b) => ({
        id: b.id,
        beneficio: b.beneficio,
        limiteOperacoes: b.limiteOperacoes?.toString() ?? "",
      })),
    });
    setOpen(true);
  };

  const addBeneficio = () => {
    setForm({
      ...form,
      beneficios: [...form.beneficios, { beneficio: "", limiteOperacoes: "" }],
    });
  };

  const updateBeneficio = (index: number, patch: Partial<BeneficioForm>) => {
    const beneficios = [...form.beneficios];
    beneficios[index] = { ...beneficios[index], ...patch };
    setForm({ ...form, beneficios });
  };

  const removeBeneficio = (index: number) => {
    setForm({
      ...form,
      beneficios: form.beneficios.filter((_, i) => i !== index),
    });
  };

  const submit = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    const valor = Number(form.valorMensal);
    if (!valor || valor <= 0)
      return toast.error("Informe um valor mensal válido");
    if (form.beneficios.some((b) => !b.beneficio.trim())) {
      return toast.error("Todo benefício precisa de uma descrição");
    }

    setSaving(true);
    try {
      await upsertPlano({
        id: editId ?? undefined,
        titulo: form.titulo,
        descricao: form.descricao || null,
        valorMensal: valor,
        stripePriceId: form.stripePriceId || null,
        ordem: form.ordem,
        ativo: form.ativo,
        beneficios: form.beneficios.map((b) => ({
          id: b.id,
          beneficio: b.beneficio,
          limiteOperacoes: b.limiteOperacoes ? Number(b.limiteOperacoes) : null,
        })),
      });
      toast.success(editId ? "Plano atualizado" : "Plano criado");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar plano",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deletePlano(id);
      toast.success("Plano excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir plano");
    }
  };

  const toggle = async (p: PlanoComBeneficios) => {
    try {
      await togglePlanoAtivo(p.id);
      toast.success(p.ativo ? "Plano inativado" : "Plano ativado");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Plano
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Benefícios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum plano cadastrado
                </TableCell>
              </TableRow>
            )}
            {planos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell>
                  {Number(p.valorMensal).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>{p.beneficios.length} benefício(s)</TableCell>
                <TableCell>
                  <Badge variant={p.ativo ? "default" : "secondary"}>
                    {p.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggle(p)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    description={`Excluir o plano "${p.titulo}"? Isso também apaga os benefícios vinculados.`}
                    onConfirm={() => remove(p.id)}
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
              <CreditCard className="h-5 w-5" />
              {editId ? "Editar Plano" : "Novo Plano"}
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
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Valor mensal (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.valorMensal}
                  onChange={(e) =>
                    setForm({ ...form, valorMensal: e.target.value })
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
              <Label>Price ID do Stripe (opcional)</Label>
              <Input
                value={form.stripePriceId}
                onChange={(e) =>
                  setForm({ ...form, stripePriceId: e.target.value })
                }
                placeholder="price_..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Benefícios</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBeneficio}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>
              {form.beneficios.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum benefício adicionado ainda.
                </p>
              )}
              <div className="space-y-2">
                {form.beneficios.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border p-2"
                  >
                    <div className="flex-1 space-y-1.5">
                      <Input
                        placeholder="Descrição do benefício"
                        value={b.beneficio}
                        onChange={(e) =>
                          updateBeneficio(i, { beneficio: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        min={1}
                        placeholder="Limite de operações (opcional)"
                        value={b.limiteOperacoes}
                        onChange={(e) =>
                          updateBeneficio(i, {
                            limiteOperacoes: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeBeneficio(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Plano ativo</span>
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

export default PlanosManager;
