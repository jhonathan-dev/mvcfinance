import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Mantém a mesma lista que já existia como enum, só que agora como
// registros de verdade — assim o CRUD do admin tem o que exibir/editar
// desde o primeiro acesso, sem perder nada do que já estava no sistema.

const TIPOS_OPERACAO = ["Depósito", "Despesa", "Investimento"] as const;

const CATEGORIAS: { nome: string; tipo: (typeof TIPOS_OPERACAO)[number] }[] = [
  // Despesa
  { nome: "Moradia", tipo: "Despesa" },
  { nome: "Transporte", tipo: "Despesa" },
  { nome: "Alimentação", tipo: "Despesa" },
  { nome: "Saúde", tipo: "Despesa" },
  { nome: "Educação", tipo: "Despesa" },
  { nome: "Entretenimento", tipo: "Despesa" },
  { nome: "Vestuário", tipo: "Despesa" },
  { nome: "Beleza e Cuidados Pessoais", tipo: "Despesa" },
  { nome: "Pets", tipo: "Despesa" },
  { nome: "Viagens", tipo: "Despesa" },
  { nome: "Assinaturas e Streaming", tipo: "Despesa" },
  { nome: "Telefone e Internet", tipo: "Despesa" },
  { nome: "Energia e Água", tipo: "Despesa" },
  { nome: "Impostos e Taxas", tipo: "Despesa" },
  { nome: "Seguros", tipo: "Despesa" },
  // Depósito
  { nome: "Salário", tipo: "Depósito" },
  { nome: "Freelance", tipo: "Depósito" },
  { nome: "Aluguel Recebido", tipo: "Depósito" },
  { nome: "Dividendos", tipo: "Depósito" },
  { nome: "Reembolso", tipo: "Depósito" },
  { nome: "Presente Recebido", tipo: "Depósito" },
  { nome: "Venda de Bens", tipo: "Depósito" },
  // Investimento
  { nome: "Renda Fixa", tipo: "Investimento" },
  { nome: "Renda Variável", tipo: "Investimento" },
  { nome: "Fundos Imobiliários", tipo: "Investimento" },
  { nome: "Criptomoedas", tipo: "Investimento" },
  { nome: "Previdência Privada", tipo: "Investimento" },
  { nome: "Poupança", tipo: "Investimento" },
];

const METODOS_PAGAMENTO = [
  { nome: "Cartão de Crédito", icone: "/credit-card.svg" },
  { nome: "Cartão de Débito", icone: "/debit-card.svg" },
  { nome: "Transferência Bancária", icone: "/bank-transfer.svg" },
  { nome: "Boleto Bancário", icone: "/bank-slip.svg" },
  { nome: "Dinheiro", icone: "/money.svg" },
  { nome: "Pix", icone: "/pix.svg" },
];

const TEMAS_CURSO = [
  {
    titulo: "Fundamentos Financeiros",
    descricao: "Domine o básico da gestão de dinheiro",
    ordem: 1,
  },
  {
    titulo: "Construção de Patrimônio",
    descricao: "Faça seu dinheiro crescer com investimentos inteligentes",
    ordem: 2,
  },
  {
    titulo: "Liberdade Financeira",
    descricao: "Projete uma vida de independência e abundância",
    ordem: 3,
  },
];

async function main() {
  console.log("Seed: tipos de operação...");
  const tipos: Record<string, string> = {};
  for (const tipo of TIPOS_OPERACAO) {
    const criado = await db.tipoOperacao.upsert({
      where: { tipo },
      update: {},
      create: { tipo },
    });
    tipos[tipo] = criado.id;
  }

  console.log("Seed: categorias...");
  for (const categoria of CATEGORIAS) {
    const existente = await db.categoria.findFirst({
      where: { nome: categoria.nome },
    });
    if (!existente) {
      await db.categoria.create({
        data: { nome: categoria.nome, tipoOperacaoId: tipos[categoria.tipo] },
      });
    }
  }

  console.log("Seed: métodos de pagamento...");
  for (const metodo of METODOS_PAGAMENTO) {
    const existente = await db.metodoPagamento.findFirst({
      where: { nome: metodo.nome },
    });
    if (!existente) {
      await db.metodoPagamento.create({ data: metodo });
    }
  }

  console.log("Seed: temas de curso...");
  for (const tema of TEMAS_CURSO) {
    const existente = await db.temaCurso.findFirst({
      where: { titulo: tema.titulo },
    });
    if (!existente) {
      await db.temaCurso.create({ data: tema });
    }
  }

  console.log("Seed: constantes de XP...");
  const constantesExistentes = await db.constantesXP.findFirst();
  if (!constantesExistentes) {
    await db.constantesXP.create({
      data: { qtdXpCurso: 100, qtdXpLicao: 20, qtdXpQuestionario: 50 },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
