// Catálogo das ações que vão para a auditoria. Fica num arquivo sem nada de
// servidor para poder ser usado tanto pelas actions (que gravam) quanto pela
// tela /admin/auditoria (que mostra e filtra).
//
// Padrão do código: "<entidade>.<ação>". A entidade (antes do ponto) vira o
// agrupamento do filtro na tela.

export const ENTIDADES_AUDITORIA = {
  categoria: "Categorias",
  metodo_pagamento: "Métodos de pagamento",
  tipo_operacao: "Tipos de operação",
  tema: "Temas de curso",
  curso: "Cursos",
  modulo: "Módulos",
  licao: "Lições",
  questionario: "Questionários",
  questao: "Questões",
  conquista: "Conquistas",
  xp: "Configuração de XP",
  usuario: "Usuários",
  acesso: "Acessos negados",
} as const;

export const ACOES_AUDITORIA = {
  "categoria.criar": "Criou categoria",
  "categoria.editar": "Editou categoria",
  "categoria.ativar": "Ativou categoria",
  "categoria.inativar": "Inativou categoria",
  "categoria.excluir": "Excluiu categoria",

  "metodo_pagamento.criar": "Criou método de pagamento",
  "metodo_pagamento.editar": "Editou método de pagamento",
  "metodo_pagamento.ativar": "Ativou método de pagamento",
  "metodo_pagamento.inativar": "Inativou método de pagamento",
  "metodo_pagamento.excluir": "Excluiu método de pagamento",

  "tipo_operacao.criar": "Criou tipo de operação",
  "tipo_operacao.editar": "Editou tipo de operação",
  "tipo_operacao.ativar": "Ativou tipo de operação",
  "tipo_operacao.inativar": "Inativou tipo de operação",
  "tipo_operacao.excluir": "Excluiu tipo de operação",

  "tema.criar": "Criou tema de curso",
  "tema.editar": "Editou tema de curso",
  "tema.excluir": "Excluiu tema de curso",

  "curso.criar": "Criou curso",
  "curso.editar": "Editou curso",
  "curso.excluir": "Excluiu curso",
  "curso.desbloquear": "Desbloqueou curso",
  "curso.bloquear": "Bloqueou curso",

  "modulo.criar": "Criou módulo",
  "modulo.editar": "Editou módulo",
  "modulo.excluir": "Excluiu módulo",
  "modulo.desbloquear": "Desbloqueou módulo",
  "modulo.bloquear": "Bloqueou módulo",

  "licao.criar": "Criou lição",
  "licao.editar": "Editou lição",
  "licao.excluir": "Excluiu lição",
  "licao.desbloquear": "Desbloqueou lição",
  "licao.bloquear": "Bloqueou lição",

  "questionario.criar": "Criou questionário",
  "questionario.editar": "Editou questionário",

  "questao.criar": "Criou questão",
  "questao.editar": "Editou questão",
  "questao.excluir": "Excluiu questão",
  "questao.ativar": "Ativou questão",
  "questao.inativar": "Inativou questão",

  "conquista.criar": "Criou conquista",
  "conquista.editar": "Editou conquista",
  "conquista.excluir": "Excluiu conquista",

  "xp.editar": "Alterou a configuração de XP",

  "usuario.promover_admin": "Promoveu usuário a administrador",
  "usuario.remover_admin": "Removeu permissão de administrador",
  "usuario.tornar_premium": "Concedeu plano premium",
  "usuario.remover_premium": "Removeu plano premium",
  "usuario.banir": "Baniu usuário",
  "usuario.desbanir": "Removeu banimento do usuário",
  "usuario.excluir": "Excluiu usuário",
  "usuario.convidar": "Convidou usuário",
  "usuario.revogar_convite": "Revogou convite",

  // Alguém sem permissão de admin tentou executar uma ação do painel.
  "acesso.negado": "Tentativa de ação administrativa negada",
} as const;

export type AcaoAuditoria = keyof typeof ACOES_AUDITORIA;

export const rotuloDaAcao = (acao: string) =>
  (ACOES_AUDITORIA as Record<string, string>)[acao] ??
  (acao === "legado" ? "Registro antigo" : acao);

export const entidadeDaAcao = (acao: string) => acao.split(".")[0];
