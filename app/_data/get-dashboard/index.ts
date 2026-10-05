import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PercentualPorTipo, TotalPorCategoria } from "./types";

export const getDashboard = async (month: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const tipos = await db.tipoOperacao.findMany();
  const tipoDeposito = tipos.find((t) => t.tipo === "Depósito");
  const tipoDespesa = tipos.find((t) => t.tipo === "Despesa");
  const tipoInvestimento = tipos.find((t) => t.tipo === "Investimento");

  const where = {
    usuarioId: userId,
    data: {
      gte: new Date(`2026-${month}-01`),
      lt: new Date(`2026-${month}-31`),
    },
  };

  const somarPorTipo = async (tipoOperacaoId?: string) =>
    Number(
      (
        await db.operacao.aggregate({
          where: { ...where, tipoOperacaoId },
          _sum: { valor: true },
        })
      )._sum.valor ?? 0,
    );

  const depositosTotal = await somarPorTipo(tipoDeposito?.id);
  const investimentosTotal = await somarPorTipo(tipoInvestimento?.id);
  const despesasTotal = await somarPorTipo(tipoDespesa?.id);
  const balance = depositosTotal - investimentosTotal - despesasTotal;

  const operacoesTotal = Number(
    (await db.operacao.aggregate({ where, _sum: { valor: true } }))._sum
      .valor ?? 0,
  );

  const percentual = (valor: number) =>
    operacoesTotal > 0 ? Math.round((valor / operacoesTotal) * 100) : 0;

  const percentualPorTipo: PercentualPorTipo[] = [
    { tipo: "Depósito", percentual: percentual(depositosTotal) },
    { tipo: "Despesa", percentual: percentual(despesasTotal) },
    { tipo: "Investimento", percentual: percentual(investimentosTotal) },
  ];

  const agrupadoPorCategoria = await db.operacao.groupBy({
    by: ["categoriaId"],
    where: { ...where, tipoOperacaoId: tipoDespesa?.id },
    _sum: { valor: true },
  });
  const categoriasEnvolvidas = await db.categoria.findMany({
    where: { id: { in: agrupadoPorCategoria.map((c) => c.categoriaId) } },
  });
  const totalPorCategoria: TotalPorCategoria[] = agrupadoPorCategoria.map(
    (c) => {
      const valorTotal = Number(c._sum.valor ?? 0);
      return {
        categoriaId: c.categoriaId,
        categoriaNome:
          categoriasEnvolvidas.find((cat) => cat.id === c.categoriaId)?.nome ??
          "—",
        valorTotal,
        percentualDoTotal:
          despesasTotal > 0
            ? Math.round((valorTotal / despesasTotal) * 100)
            : 0,
      };
    },
  );

  const ultimasOperacoes = await db.operacao.findMany({
    where,
    orderBy: { data: "desc" },
    take: 15,
    include: { categoria: true, tipoOperacao: true, metodoPagamento: true },
  });

  return {
    balance,
    depositosTotal,
    investimentosTotal,
    despesasTotal,
    percentualPorTipo,
    totalPorCategoria,
    ultimasOperacoes: JSON.parse(JSON.stringify(ultimasOperacoes)),
  };
};
