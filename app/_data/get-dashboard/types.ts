export interface PercentualPorTipo {
  tipo: string; // "Depósito" | "Despesa" | "Investimento"
  percentual: number;
}

export interface TotalPorCategoria {
  categoriaId: string;
  categoriaNome: string;
  valorTotal: number;
  percentualDoTotal: number;
}
