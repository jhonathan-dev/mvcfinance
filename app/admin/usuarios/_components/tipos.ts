// Dados já preparados no servidor (datas formatadas, sem objetos do Clerk)
// para a tela de usuários.
export interface UsuarioLinha {
  id: string; // id do Clerk
  nome: string;
  email: string;
  imagem: string;
  admin: boolean;
  premium: boolean;
  banido: boolean;
  bloqueado: boolean;
  cadastro: string;
  ultimoAcesso: string | null;
  xp: number | null; // null = ainda não entrou na área de educação
  cursosConcluidos: number;
  operacoes: number;
  ehVoce: boolean;
}

export interface ConviteLinha {
  id: string;
  email: string;
  admin: boolean;
  enviadoEm: string;
}
