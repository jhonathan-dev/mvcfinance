"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { limitesDoMes, NOMES_DOS_MESES } from "@/app/_lib/periodo";
import { GenerateAiReportSchema, generateAiReportSchema } from "./schema";

const DUMMY_REPORT =
  "### Relatório de Finanças Pessoais\n\n#### Resumo Geral das Finanças\nAs operações listadas foram analisadas e as seguintes informações foram extraídas para oferecer insights sobre suas finanças:\n\n- **Total de despesas:** R$ 19.497,56\n- **Total de investimentos:** R$ 14.141,47\n- **Total de depósitos:** R$ 10.100,00\n- **Categoria de maior despesa:** Alimentação\n\n#### Conclusão\nMelhorar sua vida financeira é um processo contínuo que envolve planejamento, monitoramento e ajustes regulares.";

export const generateAiReport = async (params: GenerateAiReportSchema) => {
  const { month, year } = generateAiReportSchema.parse(params);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  if (!hasPremiumPlan) {
    throw new Error("You need a premium plan to generate AI reports");
  }
  if (!process.env.OPENAI_API_KEY) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return DUMMY_REPORT;
  }
  const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Mesmo período que o Dashboard está mostrando (mês e ano escolhidos).
  const { inicio, fim } = limitesDoMes({ ano: year, mes: month });
  const operacoes = await db.operacao.findMany({
    where: {
      usuarioId: userId,
      data: { gte: inicio, lt: fim },
    },
    include: { categoria: true, tipoOperacao: true },
  });

  const content = `Gere um relatório com insights sobre as minhas finanças de ${NOMES_DOS_MESES[month - 1]} de ${year}, com dicas e orientações de como melhorar minha vida financeira. As operações estão divididas por ponto e vírgula. A estrutura de cada uma é {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
  ${operacoes
    .map(
      (operacao) =>
        `${operacao.data.toLocaleDateString("pt-BR")}-R$${operacao.valor}-${operacao.tipoOperacao.tipo}-${operacao.categoria.nome}`,
    )
    .join(";")}`;

  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças.",
      },
      { role: "user", content },
    ],
  });

  return completion.choices[0].message.content;
};
