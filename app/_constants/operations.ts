// Esses labels são usados apenas para exibição em componentes
// que ainda não buscam do banco dinamicamente

export const TRANSACTION_CATEGORY_LABELS: Record<string, string> = {
  Moradia: "Moradia",
  Transporte: "Transporte",
  Alimentação: "Alimentação",
  Entretenimento: "Entretenimento",
  Saúde: "Saúde",
  Utilidades: "Utilidades",
  Salário: "Salário",
  Educação: "Educação",
  Outros: "Outros",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS: Record<string, string> = {
  "Transferência Bancária": "Transferência Bancária",
  "Boleto Bancário": "Boleto Bancário",
  Dinheiro: "Dinheiro",
  "Cartão de Crédito": "Cartão de Crédito",
  "Cartão de Débito": "Cartão de Débito",
  Pix: "Pix",
  Outros: "Outros",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  Depósito: "Depósito",
  Despesa: "Despesa",
  Investimento: "Investimento",
};
