import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";
import { limitesDoMes } from "@/app/_lib/periodo";
import { gerarPdfRelatorio } from "./gerar-pdf";

// GET /transactions/relatorio?mes=2026-10&formato=pdf|csv  (padrão: pdf)
// Baixa o relatório das operações do mês do usuário logado, com resumo.

const SEPARADOR = ";"; // o Excel em português espera ponto e vírgula
const FUSO = "America/Sao_Paulo";

// Evita "injeção de fórmula": um título como =HYPERLINK(...) seria executado
// pelo Excel ao abrir o arquivo. Prefixar com apóstrofo o transforma em texto.
const textoSeguro = (valor: string) =>
  /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;

// Números (como um saldo negativo "-50,00") entram como `{ numero }` e não
// passam pela proteção acima, senão virariam texto.
type Celula = string | { numero: string };

const celula = (valor: Celula) => {
  if (typeof valor !== "string") return valor.numero;
  const texto = textoSeguro(valor);
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

// 1234.5 -> "1234,50" (sem separador de milhar, para o Excel ler como número)
const numeroBr = (valor: number) => valor.toFixed(2).replace(".", ",");

const dataBr = (data: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO }).format(data);

export const GET = async (request: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mes = new URL(request.url).searchParams.get("mes") ?? "";
  const partes = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(mes);
  if (!partes) {
    return NextResponse.json(
      { error: "Informe o mês no formato AAAA-MM" },
      { status: 400 },
    );
  }
  const formato = new URL(request.url).searchParams.get("formato") ?? "pdf";
  if (formato !== "pdf" && formato !== "csv") {
    return NextResponse.json(
      { error: "Formato inválido. Use pdf ou csv" },
      { status: 400 },
    );
  }
  const ano = Number(partes[1]);
  const numeroMes = Number(partes[2]);

  const { inicio, fim } = limitesDoMes({ ano, mes: numeroMes });
  const operacoes = await db.operacao.findMany({
    where: { usuarioId: userId, data: { gte: inicio, lt: fim } },
    include: { categoria: true, tipoOperacao: true, metodoPagamento: true },
    orderBy: [{ data: "asc" }, { createdAt: "asc" }],
  });

  const totais = { Depósito: 0, Despesa: 0, Investimento: 0 };
  for (const operacao of operacoes) {
    const tipo = operacao.tipoOperacao.tipo;
    if (tipo in totais)
      totais[tipo as keyof typeof totais] += Number(operacao.valor);
  }

  if (formato === "pdf") {
    const pdf = gerarPdfRelatorio({
      ano,
      mes: numeroMes,
      totais: {
        depositos: totais.Depósito,
        despesas: totais.Despesa,
        investimentos: totais.Investimento,
      },
      operacoes: operacoes.map((operacao) => ({
        data: dataBr(operacao.data),
        nome: operacao.titulo,
        tipo: operacao.tipoOperacao.tipo,
        categoria: operacao.categoria.nome,
        metodo: operacao.metodoPagamento.nome,
        valor: Number(operacao.valor),
      })),
    });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-transacoes-${mes}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const linhas: Celula[][] = [
    ["Data", "Nome", "Tipo", "Categoria", "Método de Pagamento", "Valor (R$)"],
  ];

  for (const operacao of operacoes) {
    const valor = Number(operacao.valor);
    const tipo = operacao.tipoOperacao.tipo;
    linhas.push([
      dataBr(operacao.data),
      operacao.titulo,
      tipo,
      operacao.categoria.nome,
      operacao.metodoPagamento.nome,
      { numero: numeroBr(valor) },
    ]);
  }

  // Mesma conta do Dashboard: saldo = depósitos - despesas - investimentos.
  const saldo = totais.Depósito - totais.Despesa - totais.Investimento;
  linhas.push(
    [],
    ["Resumo do mês"],
    ["Total de depósitos", { numero: numeroBr(totais.Depósito) }],
    ["Total de despesas", { numero: numeroBr(totais.Despesa) }],
    ["Total de investimentos", { numero: numeroBr(totais.Investimento) }],
    ["Saldo", { numero: numeroBr(saldo) }],
    ["Quantidade de operações", { numero: String(operacoes.length) }],
  );

  // BOM no começo para o Excel reconhecer os acentos (UTF-8).
  const csv =
    "\uFEFF" +
    linhas.map((l) => l.map(celula).join(SEPARADOR)).join("\r\n") +
    "\r\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-transacoes-${mes}.csv"`,
      "Cache-Control": "no-store",
    },
  });
};
