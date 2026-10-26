import { db } from "@/app/_lib/prisma";
import { inicioDoDia, inicioDoDiaSeguinte } from "@/app/_lib/periodo";
import { Prisma } from "@prisma/client";

// Quantas operações aparecem por página na tela de Operações.
export const TRANSACOES_POR_PAGINA = 15;

type ParametroDeUrl = string | string[] | undefined;
export type SearchParamsTransacoes = Record<string, ParametroDeUrl>;

export interface FiltrosTransacoes {
  tipoId?: string;
  categoriaId?: string;
  metodoId?: string;
  de?: string; // yyyy-MM-dd
  ate?: string; // yyyy-MM-dd
  valorMin?: number;
  valorMax?: number;
  pagina: number;
}

const primeiro = (valor: ParametroDeUrl) =>
  (Array.isArray(valor) ? valor[0] : valor)?.trim() || undefined;

const lerId = (valor: ParametroDeUrl) => {
  const id = primeiro(valor);
  return id && id.length <= 64 ? id : undefined;
};

const lerData = (valor: ParametroDeUrl) => {
  const data = primeiro(valor);
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return undefined;
  // "2026-02-31" passa na regex mas não existe: confere se a data é real.
  const parsed = new Date(`${data}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10) === data ? data : undefined;
};

// Aceita "1234.56" e "1.234,56"/"1234,56" (formato brasileiro).
const lerValor = (valor: ParametroDeUrl) => {
  const texto = primeiro(valor);
  if (!texto) return undefined;
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero < 0 || numero > 99_999_999) {
    return undefined;
  }
  return numero;
};

// Tudo o que vem da URL é tratado como "talvez lixo": o que não for válido
// simplesmente é ignorado, nunca quebra a página.
export const lerFiltros = (
  params: SearchParamsTransacoes,
): FiltrosTransacoes => {
  let de = lerData(params.de);
  let ate = lerData(params.ate);
  if (de && ate && de > ate) [de, ate] = [ate, de];

  let valorMin = lerValor(params.valorMin);
  let valorMax = lerValor(params.valorMax);
  if (valorMin !== undefined && valorMax !== undefined && valorMin > valorMax) {
    [valorMin, valorMax] = [valorMax, valorMin];
  }

  const pagina = Number.parseInt(primeiro(params.pagina) ?? "1", 10);

  return {
    tipoId: lerId(params.tipo),
    categoriaId: lerId(params.categoria),
    metodoId: lerId(params.metodo),
    de,
    ate,
    valorMin,
    valorMax,
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
};

export const getTransacoes = async (
  usuarioId: string,
  filtros: FiltrosTransacoes,
) => {
  const where: Prisma.OperacaoWhereInput = {
    // Sempre filtra pelo usuário logado: um usuário nunca vê dados de outro.
    usuarioId,
    ...(filtros.tipoId && { tipoOperacaoId: filtros.tipoId }),
    ...(filtros.categoriaId && { categoriaId: filtros.categoriaId }),
    ...(filtros.metodoId && { metodoPagamentoId: filtros.metodoId }),
    ...((filtros.de || filtros.ate) && {
      data: {
        ...(filtros.de && { gte: inicioDoDia(filtros.de) }),
        // "até" inclui o dia inteiro: vai até o começo do dia seguinte.
        ...(filtros.ate && { lt: inicioDoDiaSeguinte(filtros.ate) }),
      },
    }),
    ...((filtros.valorMin !== undefined || filtros.valorMax !== undefined) && {
      valor: {
        ...(filtros.valorMin !== undefined && { gte: filtros.valorMin }),
        ...(filtros.valorMax !== undefined && { lte: filtros.valorMax }),
      },
    }),
  };

  const total = await db.operacao.count({ where });
  const totalPaginas = Math.max(1, Math.ceil(total / TRANSACOES_POR_PAGINA));
  // Se a pessoa abrir ?pagina=99 (ou apagar o último item de uma página),
  // cai na última página que existe em vez de mostrar uma tela vazia.
  const pagina = Math.min(filtros.pagina, totalPaginas);

  const operacoes = await db.operacao.findMany({
    where,
    include: { categoria: true, tipoOperacao: true, metodoPagamento: true },
    // O desempate por id mantém a ordem estável entre as páginas.
    orderBy: [{ data: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    skip: (pagina - 1) * TRANSACOES_POR_PAGINA,
    take: TRANSACOES_POR_PAGINA,
  });

  return { operacoes, total, pagina, totalPaginas };
};
