"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Lock, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";

interface Item {
  id: string;
  label: string;
  isDefault: boolean;
  userId: string | null;
}

interface ManageItemsSectionProps {
  title: string;
  items: Item[];
  onAdd: (label: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ManageItemsSection = ({
  title,
  items,
  onAdd,
  onDelete,
}: ManageItemsSectionProps) => {
  const [newLabel, setNewLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setIsAdding(true);
    try {
      await onAdd(newLabel.trim());
      setNewLabel("");
      toast.success(`"${newLabel}" adicionado com sucesso!`);
    } catch {
      toast.error("Erro ao adicionar. Tente novamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast.success(`"${label}" removido com sucesso!`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao remover.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {/* Lista de itens */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item.id}
            variant="outline"
            className="flex items-center gap-1.5 border-white/20 px-3 py-1.5 text-sm text-white/80"
          >
            {item.label}
            {item.isDefault ? (
              <Lock className="h-3 w-3 text-white/40" />
            ) : (
              <button
                onClick={() => handleDelete(item.id, item.label)}
                disabled={deletingId === item.id}
                className="ml-1 text-white/40 transition-colors hover:text-red-400"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            )}
          </Badge>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-white/40">Nenhum item encontrado.</p>
        )}
      </div>

      {/* Input para adicionar novo */}
      <div className="mt-2 flex gap-2">
        <Input
          placeholder={`Novo ${title.toLowerCase()}...`}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/20"
        />
        <Button
          onClick={handleAdd}
          disabled={isAdding || !newLabel.trim()}
          className="gap-2 border border-white/10 bg-white/10 text-white hover:bg-white/20"
          variant="outline"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar
        </Button>
      </div>
    </div>
  );
};

export default ManageItemsSection;
