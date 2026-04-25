import {
  OperationCategory,
  OperationPaymentMethod,
  OperationType,
} from "@prisma/client";

export const TRANSACTION_CATEGORY_LABELS = {
  EDUCATION: "Educação",
  ENTERTAINMENT: "Entretenimento",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  HOUSING: "Moradia",
  OTHER: "Outros",
  SALARY: "Salário",
  TRANSPORTATION: "Transporte",
  UTILITY: "Utilidades",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: "Transferência Bancária",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  OTHER: "Outros",
  PIX: "Pix",
};

export const TRANSACTION_TYPE_OPTIONS = [
  {
    value: OperationType.EXPENSE,
    label: "Despesa",
  },
  {
    value: OperationType.DEPOSIT,
    label: "Depósito",
  },
  {
    value: OperationType.INVESTMENT,
    label: "Investimento",
  },
];

export const TRANSACTION_PAYMENT_METHOD_OPTIONS = [
  {
    value: OperationPaymentMethod.BANK_TRANSFER,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.BANK_TRANSFER],
  },
  {
    value: OperationPaymentMethod.BANK_SLIP,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.BANK_SLIP],
  },
  {
    value: OperationPaymentMethod.CASH,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.CASH],
  },
  {
    value: OperationPaymentMethod.CREDIT_CARD,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.CREDIT_CARD],
  },
  {
    value: OperationPaymentMethod.DEBIT_CARD,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.DEBIT_CARD],
  },
  {
    value: OperationPaymentMethod.OTHER,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.OTHER],
  },
  {
    value: OperationPaymentMethod.PIX,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[OperationPaymentMethod.PIX],
  },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  {
    value: OperationCategory.EDUCATION,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.EDUCATION],
  },
  {
    value: OperationCategory.ENTERTAINMENT,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.ENTERTAINMENT],
  },
  {
    value: OperationCategory.FOOD,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.FOOD],
  },
  {
    value: OperationCategory.HEALTH,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.HEALTH],
  },
  {
    value: OperationCategory.HOUSING,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.HOUSING],
  },
  {
    value: OperationCategory.OTHER,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.OTHER],
  },
  {
    value: OperationCategory.SALARY,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.SALARY],
  },
  {
    value: OperationCategory.TRANSPORTATION,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.TRANSPORTATION],
  },
  {
    value: OperationCategory.UTILITY,
    label: TRANSACTION_CATEGORY_LABELS[OperationCategory.UTILITY],
  },
];
