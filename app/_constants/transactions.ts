import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

export const TRANSACTION_CATEGORY_LABELS = {
  // EXPENSE
  HOUSING: "Moradia",
  TRANSPORTATION: "Transporte",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  ENTERTAINMENT: "Entretenimento",
  CLOTHING: "Vestuário",
  BEAUTY: "Beleza e Cuidados Pessoais",
  PETS: "Pets",
  TRAVEL: "Viagens",
  SUBSCRIPTIONS: "Assinaturas e Streaming",
  PHONE_INTERNET: "Telefone e Internet",
  ENERGY_WATER: "Energia e Água",
  TAXES: "Impostos e Taxas",
  INSURANCE: "Seguros",
  // DEPOSIT
  SALARY: "Salário",
  FREELANCE: "Freelance",
  RENTAL_INCOME: "Aluguel Recebido",
  DIVIDENDS: "Dividendos",
  REFUND: "Reembolso",
  GIFT_RECEIVED: "Presente Recebido",
  ASSET_SALE: "Venda de Bens",
  // INVESTMENT
  FIXED_INCOME: "Renda Fixa",
  VARIABLE_INCOME: "Renda Variável",
  REAL_ESTATE_FUNDS: "Fundos Imobiliários",
  CRYPTO: "Criptomoedas",
  PRIVATE_PENSION: "Previdência Privada",
  SAVINGS: "Poupança",
};

export const TRANSACTION_PAYMENT_METHOD_ICONS = {
  CREDIT_CARD: "credit-card.svg",
  DEBIT_CARD: "debit-card.svg",
  BANK_TRANSFER: "bank-transfer.svg",
  BANK_SLIP: "bank-slip.svg",
  CASH: "money.svg",
  PIX: "pix.svg",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: "Transferência Bancária",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "Pix",
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.EXPENSE, label: "Despesa" },
  { value: TransactionType.DEPOSIT, label: "Depósito" },
  { value: TransactionType.INVESTMENT, label: "Investimento" },
];

export const TRANSACTION_PAYMENT_METHOD_OPTIONS = [
  {
    value: TransactionPaymentMethod.BANK_TRANSFER,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.BANK_TRANSFER],
  },
  {
    value: TransactionPaymentMethod.BANK_SLIP,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.BANK_SLIP],
  },
  {
    value: TransactionPaymentMethod.CASH,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.CASH],
  },
  {
    value: TransactionPaymentMethod.CREDIT_CARD,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.CREDIT_CARD],
  },
  {
    value: TransactionPaymentMethod.DEBIT_CARD,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.DEBIT_CARD],
  },
  {
    value: TransactionPaymentMethod.PIX,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.PIX],
  },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  // EXPENSE
  {
    value: TransactionCategory.HOUSING,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.HOUSING],
  },
  {
    value: TransactionCategory.TRANSPORTATION,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.TRANSPORTATION],
  },
  {
    value: TransactionCategory.FOOD,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.FOOD],
  },
  {
    value: TransactionCategory.HEALTH,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.HEALTH],
  },
  {
    value: TransactionCategory.EDUCATION,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.EDUCATION],
  },
  {
    value: TransactionCategory.ENTERTAINMENT,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.ENTERTAINMENT],
  },
  {
    value: TransactionCategory.CLOTHING,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.CLOTHING],
  },
  {
    value: TransactionCategory.BEAUTY,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.BEAUTY],
  },
  {
    value: TransactionCategory.PETS,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.PETS],
  },
  {
    value: TransactionCategory.TRAVEL,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.TRAVEL],
  },
  {
    value: TransactionCategory.SUBSCRIPTIONS,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.SUBSCRIPTIONS],
  },
  {
    value: TransactionCategory.PHONE_INTERNET,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.PHONE_INTERNET],
  },
  {
    value: TransactionCategory.ENERGY_WATER,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.ENERGY_WATER],
  },
  {
    value: TransactionCategory.TAXES,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.TAXES],
  },
  {
    value: TransactionCategory.INSURANCE,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.INSURANCE],
  },
  // DEPOSIT
  {
    value: TransactionCategory.SALARY,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.SALARY],
  },
  {
    value: TransactionCategory.FREELANCE,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.FREELANCE],
  },
  {
    value: TransactionCategory.RENTAL_INCOME,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.RENTAL_INCOME],
  },
  {
    value: TransactionCategory.DIVIDENDS,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.DIVIDENDS],
  },
  {
    value: TransactionCategory.REFUND,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.REFUND],
  },
  {
    value: TransactionCategory.GIFT_RECEIVED,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.GIFT_RECEIVED],
  },
  {
    value: TransactionCategory.ASSET_SALE,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.ASSET_SALE],
  },
  // INVESTMENT
  {
    value: TransactionCategory.FIXED_INCOME,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.FIXED_INCOME],
  },
  {
    value: TransactionCategory.VARIABLE_INCOME,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.VARIABLE_INCOME],
  },
  {
    value: TransactionCategory.REAL_ESTATE_FUNDS,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.REAL_ESTATE_FUNDS],
  },
  {
    value: TransactionCategory.CRYPTO,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.CRYPTO],
  },
  {
    value: TransactionCategory.PRIVATE_PENSION,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.PRIVATE_PENSION],
  },
  {
    value: TransactionCategory.SAVINGS,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.SAVINGS],
  },
];
