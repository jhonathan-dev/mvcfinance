"use client";

import { useState } from "react";
import { ConstantesXP } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { GraduationCap, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { updateConstantesXP } from "../../_actions/constantes-xp";

const ConfiguracaoXPForm = ({ constantes }: { constantes: ConstantesXP }) => {
  const [form, setForm] = useState({
    qtdXpCurso: constantes.qtdXpCurso,
    qtdXpLicao: constantes.qtdXpLicao,
    qtdXpQuestionario: constantes.qtdXpQuestionario,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await updateConstantesXP(form);
      toast.success("Configuração de XP atualizada");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Valores de XP</CardTitle>
        <CardDescription>
          Esse valor é concedido para qualquer curso, lição ou questionário —
          não é mais configurado item por item.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" /> XP ao concluir um Curso
          </Label>
          <Input
            type="number"
            min={0}
            value={form.qtdXpCurso}
            onChange={(e) =>
              setForm({ ...form, qtdXpCurso: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> XP ao concluir uma Lição
          </Label>
          <Input
            type="number"
            min={0}
            value={form.qtdXpLicao}
            onChange={(e) =>
              setForm({ ...form, qtdXpLicao: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" /> XP ao concluir um Questionário
          </Label>
          <Input
            type="number"
            min={0}
            value={form.qtdXpQuestionario}
            onChange={(e) =>
              setForm({ ...form, qtdXpQuestionario: Number(e.target.value) })
            }
          />
        </div>
        <Button onClick={submit} disabled={saving}>
          Salvar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfiguracaoXPForm;
