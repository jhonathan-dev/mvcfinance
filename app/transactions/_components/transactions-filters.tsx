"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterX, Search } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { OpcoesOperacao } from "@/app/_data/get-opcoes-operacao";

const TODOS = "todos";

export interface ValoresDosFiltros {
  tipo: string;
  categoria: string;
  metodo: string;
  de: string;
  ate: string;
  valorMin: string;
  valorMax: string;
}

interface TransactionsFiltersProps {
  opcoes: OpcoesOperacao;
  iniciais: ValoresDosFiltros;
}

const TransactionsFilters = ({
  opcoes,
  iniciais,
}: TransactionsFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [valores, setValores] = useState<ValoresDosFiltros>(iniciais);

  const alterar = (campo: keyof ValoresDosFiltros, valor: string) =>
    setValores((atual) => ({ ...atual, [campo]: valor }));

  // Se um tipo foi escolhido, só mostra as categorias dele.
  const categoriasVisiveis = valores.tipo
    ? opcoes.categorias.filter((c) => c.tipoOperacaoId === valores.tipo)
    : opcoes.categorias;

  const trocarTipo = (tipo: string) =>
    setValores((atual) => {
      const categoriaAindaValida = opcoes.categorias.some(
        (c) => c.id === atual.categoria && (!tipo || c.tipoOperacaoId === tipo),
      );
      return {
        ...atual,
        tipo,
        categoria: categoriaAindaValida ? atual.categoria : "",
      };
    });

  const aplicar = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(valores).forEach(([chave, valor]) => {
      if (valor.trim()) params.set(chave, valor.trim());
    });
    // Mudou o filtro: volta para a primeira página.
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const limpar = () => {
    setValores({
      tipo: "",
      categoria: "",
      metodo: "",
      de: "",
      ate: "",
      valorMin: "",
      valorMax: "",
    });
    router.push(pathname);
  };

  const temFiltro = Object.values(valores).some((v) => v !== "");

  return (
    <form
      onSubmit={aplicar}
      className="grid gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={valores.tipo || TODOS}
          onValueChange={(v) => trocarTipo(v === TODOS ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {opcoes.tipos.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={valores.categoria || TODOS}
          onValueChange={(v) => alterar("categoria", v === TODOS ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas</SelectItem>
            {categoriasVisiveis.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Método de Pagamento</Label>
        <Select
          value={valores.metodo || TODOS}
          onValueChange={(v) => alterar("metodo", v === TODOS ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {opcoes.metodos.map((metodo) => (
              <SelectItem key={metodo.id} value={metodo.id}>
                {metodo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtro-de">Data inicial</Label>
        <Input
          id="filtro-de"
          type="date"
          value={valores.de}
          max={valores.ate || undefined}
          onChange={(e) => alterar("de", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtro-ate">Data final</Label>
        <Input
          id="filtro-ate"
          type="date"
          value={valores.ate}
          min={valores.de || undefined}
          onChange={(e) => alterar("ate", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="filtro-valor-min">Valor mín.</Label>
          <Input
            id="filtro-valor-min"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0,00"
            value={valores.valorMin}
            onChange={(e) => alterar("valorMin", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-valor-max">Valor máx.</Label>
          <Input
            id="filtro-valor-max"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0,00"
            value={valores.valorMax}
            onChange={(e) => alterar("valorMax", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-6">
        <Button
          type="button"
          variant="outline"
          onClick={limpar}
          disabled={!temFiltro}
        >
          <FilterX className="mr-2 h-4 w-4" />
          Limpar
        </Button>
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>
    </form>
  );
};

export default TransactionsFilters;
