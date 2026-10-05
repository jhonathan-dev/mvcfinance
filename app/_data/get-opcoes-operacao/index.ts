import { db } from "@/app/_lib/prisma";

// Antes essas opções eram enum fixo no Prisma (TransactionCategory,
// TransactionPaymentMethod...). Agora são tabelas de verdade, editáveis
// pelo admin — então quem monta os formulários precisa buscar do banco
// em vez de importar uma lista estática.
export const getOpcoesOperacao = async () => {
  const [tipos, categorias, metodos] = await Promise.all([
    db.tipoOperacao.findMany({
      where: { ativo: true },
      orderBy: { tipo: "asc" },
    }),
    db.categoria.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    db.metodoPagamento.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
  ]);
  return { tipos, categorias, metodos };
};

export type OpcoesOperacao = Awaited<ReturnType<typeof getOpcoesOperacao>>;
