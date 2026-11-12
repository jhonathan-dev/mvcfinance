"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { limitesDoMes, NOMES_DOS_MESES } from "@/app/_lib/periodo";
import { generateAiReportSchema, GenerateAiReportSchema } from "./schema";

// Em produção o Next esconde a mensagem de erros lançados por Server Actions,
// então a tela nunca saberia o que aconteceu. Por isso a action devolve um
// resultado (ok ou erro com texto em português) em vez de lançar exceção.
export type ResultadoRelatorio =
  | { ok: true; relatorio: string }
  | { ok: false; erro: string };

const FUSO = "America/Sao_Paulo";
// Limite de operações enviadas à OpenAI (as mais recentes), para o prompt não
// crescer sem controle. Os totais sempre consideram TODAS as operações.
const MAX_OPERACOES_NO_PROMPT = 200;

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor,
  );

const dataBr = (data: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO }).format(data);

const percentual = (parte: number, total: number) =>
  total > 0 ? `${Math.round((parte / total) * 100)}%` : "0%";

interface Resumo {
  depositos: number;
  despesas: number;
  investimentos: number;
  saldo: number;
  quantidade: number;
  // Despesas por categoria, da maior para a menor.
  despesasPorCategoria: { categoria: string; valor: number }[];
}

// Os números são calculados aqui, no código, e não pela IA: modelo de
// linguagem erra conta. A IA só interpreta e dá orientações.
const resumir = (
  operacoes: { valor: unknown; tipo: string; categoria: string }[],
): Resumo => {
  let depositos = 0;
  let despesas = 0;
  let investimentos = 0;
  const porCategoria = new Map<string, number>();

  for (const operacao of operacoes) {
    const valor = Number(operacao.valor);
    if (operacao.tipo === "Depósito") depositos += valor;
    else if (operacao.tipo === "Investimento") investimentos += valor;
    else if (operacao.tipo === "Despesa") {
      despesas += valor;
      porCategoria.set(
        operacao.categoria,
        (porCategoria.get(operacao.categoria) ?? 0) + valor,
      );
    }
  }

  return {
    depositos,
    despesas,
    investimentos,
    saldo: depositos - despesas - investimentos,
    quantidade: operacoes.length,
    despesasPorCategoria: Array.from(porCategoria.entries())
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor),
  };
};

const linhasDoResumo = (resumo: Resumo) => [
  `- Total de depósitos (receitas): ${moeda(resumo.depositos)}`,
  `- Total de despesas: ${moeda(resumo.despesas)}`,
  `- Total de investimentos: ${moeda(resumo.investimentos)}`,
  `- Saldo do mês (depósitos - despesas - investimentos): ${moeda(resumo.saldo)}`,
  `- Quantidade de operações: ${resumo.quantidade}`,
];

const despesasPorCategoriaTexto = (resumo: Resumo) =>
  resumo.despesasPorCategoria.length === 0
    ? "nenhuma despesa registrada"
    : resumo.despesasPorCategoria
        .map(
          (c) =>
            `${c.categoria}: ${moeda(c.valor)} (${percentual(c.valor, resumo.despesas)} das despesas)`,
        )
        .join("; ");

// Usado quando não há chave da OpenAI configurada (ambiente de desenvolvimento):
// um resumo simples com os números reais, sem IA.
const relatorioSemIa = (titulo: string, resumo: Resumo) =>
  [
    `### Resumo de ${titulo}`,
    "",
    ...linhasDoResumo(resumo),
    "",
    `**Despesas por categoria:** ${despesasPorCategoriaTexto(resumo)}`,
    "",
    "_Relatório de demonstração: a chave da OpenAI não está configurada, então este resumo foi gerado sem inteligência artificial._",
  ].join("\n");

const mensagemDeErro = (error: unknown) => {
  console.error("Falha ao gerar o relatório com IA:", error);
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return "A chave da OpenAI está inválida ou foi revogada. Avise um administrador.";
    }
    if (error.status === 429) {
      return "O limite de uso da OpenAI foi atingido. Tente novamente mais tarde.";
    }
  }
  return "Não foi possível gerar o relatório agora. Tente novamente em instantes.";
};

export const generateAiReport = async (
  params: GenerateAiReportSchema,
): Promise<ResultadoRelatorio> => {
  const dados = generateAiReportSchema.safeParse(params);
  if (!dados.success) {
    return { ok: false, erro: "Período inválido." };
  }
  const { month, year } = dados.data;

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
  }

  try {
    const user = await clerkClient().users.getUser(userId);
    if (user.publicMetadata.subscriptionPlan !== "premium") {
      return {
        ok: false,
        erro: "O relatório com IA é exclusivo do plano premium.",
      };
    }

    // Mesmo período que o Dashboard está mostrando (mês e ano escolhidos).
    const { inicio, fim } = limitesDoMes({ ano: year, mes: month });
    const operacoes = await db.operacao.findMany({
      where: { usuarioId: userId, data: { gte: inicio, lt: fim } },
      include: { categoria: true, tipoOperacao: true },
      orderBy: [{ data: "asc" }, { createdAt: "asc" }],
    });

    const titulo = `${NOMES_DOS_MESES[month - 1]} de ${year}`;

    // Mês sem operações: não há o que analisar, então nem chama a OpenAI
    // (evita gastar e evita um relatório inventado).
    if (operacoes.length === 0) {
      return {
        ok: true,
        relatorio: `### Relatório de ${titulo}\n\nNão há operações registradas neste período, então não há o que analisar. Registre suas receitas, despesas e investimentos em **Transações** e gere o relatório novamente.`,
      };
    }

    const resumo = resumir(
      operacoes.map((o) => ({
        valor: o.valor,
        tipo: o.tipoOperacao.tipo,
        categoria: o.categoria.nome,
      })),
    );

    if (!process.env.OPENAI_API_KEY) {
      return { ok: true, relatorio: relatorioSemIa(titulo, resumo) };
    }

    const enviadas = operacoes.slice(-MAX_OPERACOES_NO_PROMPT);
    const listaDeOperacoes = enviadas
      .map(
        (o) =>
          `${dataBr(o.data)} | ${o.tipoOperacao.tipo} | ${moeda(Number(o.valor))} | ${o.categoria.nome}`,
      )
      .join("\n");
    const avisoDeCorte =
      operacoes.length > enviadas.length
        ? `\n(Lista com as ${enviadas.length} operações mais recentes de ${operacoes.length}; os totais acima consideram todas.)`
        : "";

    const content = `Gere um relatório com insights sobre as minhas finanças de ${titulo}, com dicas e orientações de como melhorar minha vida financeira.

Os totais abaixo já foram calculados pelo sistema. Use exatamente estes valores e não refaça as somas:
${linhasDoResumo(resumo).join("\n")}
- Despesas por categoria (da maior para a menor): ${despesasPorCategoriaTexto(resumo)}

Operações do mês, uma por linha, no formato DATA | TIPO | VALOR | CATEGORIA:
${listaDeOperacoes}${avisoDeCorte}`;

    const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openAi.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças. Responda em português do Brasil, em Markdown, de forma objetiva. Baseie-se apenas nos dados enviados e não invente valores.",
        },
        { role: "user", content },
      ],
    });

    const relatorio = completion.choices[0]?.message?.content;
    if (!relatorio) {
      return {
        ok: false,
        erro: "A IA não devolveu nenhum texto. Tente novamente.",
      };
    }
    return { ok: true, relatorio };
  } catch (error) {
    return { ok: false, erro: mensagemDeErro(error) };
  }
};
