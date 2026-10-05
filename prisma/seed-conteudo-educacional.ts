/**
 * Porta o conteúdo "padrão" do protótipo Lovable (finpath-forward) para o
 * banco de dados real — Cursos, Módulos, Lições, Questionário/Questões e
 * Conquistas — para que esses dados fiquem disponíveis (e editáveis) nas
 * telas de admin que já construímos, em vez de ficarem hardcoded num
 * arquivo de front-end.
 *
 * Idempotente: se um Curso com o mesmo título já existe, ele é pulado por
 * completo (não duplica módulos/lições/questionário). Rode com:
 *   npx tsx prisma/seed-conteudo-educacional.ts
 */
import { PrismaClient, NivelEnsino } from "@prisma/client";

const db = new PrismaClient();

// --- Helpers -----------------------------------------------------------

/** "3h 20min" | "8 min" | "5h 00min" -> minutos totais */
const parseDuracao = (texto: string): number => {
  const horas = texto.match(/(\d+)\s*h/);
  const minutos = texto.match(/(\d+)\s*min/);
  return (
    (horas ? parseInt(horas[1], 10) * 60 : 0) +
    (minutos ? parseInt(minutos[1], 10) : 0)
  );
};

const DIFICULDADE_PARA_NIVEL: Record<string, NivelEnsino> = {
  Iniciante: "INICIANTE",
  Intermediário: "INTERMEDIARIO",
  Avançado: "AVANCADO",
};

/** Mesmo texto-modelo que o protótipo mostra quando a lição não tem
 * conteúdo customizado — serve como ponto de partida editável pelo admin. */
const conteudoPadrao = (tituloLicao: string) =>
  `
<p>Bem-vindo à lição sobre <strong>${tituloLicao}</strong>. Aqui você vai entender, passo a passo, como esse conceito se encaixa na sua vida financeira — sem fórmulas mágicas e sem jargões complicados.</p>
<h4>Por que isso importa</h4>
<p>A maioria dos problemas com dinheiro não vem de falta de informação, e sim de falta de <strong>hábitos consistentes</strong>. Ao dominar ${tituloLicao.toLowerCase()}, você cria uma base que sustenta todas as outras decisões financeiras — do dia a dia aos grandes objetivos.</p>
<h4>Os conceitos principais</h4>
<p>Vamos focar em três pilares: <strong>clareza</strong> sobre para onde seu dinheiro vai, <strong>intenção</strong> em cada decisão e <strong>consistência</strong> nos pequenos hábitos diários.</p>
<h4>Como aplicar na prática</h4>
<p>Não espere o cenário perfeito para começar. Escolha <strong>uma única ação</strong> da lição e execute ainda esta semana.</p>
<h4>O que vem a seguir</h4>
<p>Marque a lição como concluída, anote os pontos que mais chamaram sua atenção e siga para a próxima.</p>
`.trim();

const resumoPadrao = (tituloLicao: string) =>
  `Nesta lição, você vai aprender os princípios fundamentais por trás de ${tituloLicao.toLowerCase()}, com exemplos práticos para aplicar ainda esta semana.`;

// --- Dados portados do protótipo ----------------------------------------

type LicaoSeed = { titulo: string; duracao: string };
type ModuloSeed = { titulo: string; licoes: LicaoSeed[] };
type QuestaoSeed = { enunciado: string; opcoes: string[]; correta: number };

type CursoSeed = {
  titulo: string;
  descricao: string;
  tema: string;
  duracao: string;
  dificuldade: keyof typeof DIFICULDADE_PARA_NIVEL;
  cor: string;
  desbloqueado: boolean;
  ordem: number;
  modulos: ModuloSeed[];
  questoes: QuestaoSeed[];
};

const mod = (titulo: string, licoes: [string, string][]): ModuloSeed => ({
  titulo,
  licoes: licoes.map(([t, d]) => ({ titulo: t, duracao: d })),
});

const CURSOS: CursoSeed[] = [
  {
    titulo: "Organização Financeira",
    descricao: "Construa a base de uma vida financeira saudável",
    tema: "Fundamentos Financeiros",
    duracao: "3h 20min",
    dificuldade: "Iniciante",
    cor: "#2563EB",
    desbloqueado: true,
    ordem: 1,
    modulos: [
      mod("Essenciais do Orçamento", [
        ["A Regra 50/30/20", "8 min"],
        ["Montando seu primeiro orçamento", "12 min"],
        ["Orçamento base zero", "10 min"],
      ]),
      mod("Controle de Gastos", [
        ["Categorizando despesas", "9 min"],
        ["Identificando vazamentos de dinheiro", "11 min"],
        ["Ferramentas e apps que ajudam", "7 min"],
      ]),
      mod("Reserva de Emergência", [
        ["Por que você precisa de uma", "6 min"],
        ["Quanto guardar", "8 min"],
      ]),
      mod("Hábitos Financeiros", [
        ["Rituais diários com dinheiro", "10 min"],
        ["A regra das 24 horas", "5 min"],
      ]),
    ],
    questoes: [
      {
        enunciado:
          "Na regra 50/30/20, quanto da renda deve ser destinado a gastos essenciais?",
        opcoes: ["20%", "30%", "50%", "70%"],
        correta: 2,
      },
      {
        enunciado: "O que é uma reserva de emergência?",
        opcoes: [
          "Dinheiro para investir em ações",
          "Valor guardado para imprevistos, com alta liquidez",
          "Limite do cartão de crédito",
          "Dinheiro para viagens",
        ],
        correta: 1,
      },
      {
        enunciado:
          "Qual é o primeiro passo para uma vida financeira organizada?",
        opcoes: [
          "Investir em criptomoedas",
          "Pegar um empréstimo",
          "Saber quanto entra e quanto sai todo mês",
          "Comprar uma casa",
        ],
        correta: 2,
      },
      {
        enunciado: "Orçamento base zero significa:",
        opcoes: [
          "Gastar tudo o que recebe",
          "Cada real recebido tem um destino planejado",
          "Não ter nenhum gasto",
          "Investir todo o salário",
        ],
        correta: 1,
      },
      {
        enunciado: "A regra das 24 horas serve para:",
        opcoes: [
          "Pagar contas no prazo",
          "Esperar antes de compras por impulso",
          "Renegociar dívidas",
          "Fazer investimentos rápidos",
        ],
        correta: 1,
      },
    ],
  },
  {
    titulo: "Gestão de Dívidas",
    descricao: "Assuma o controle e fique livre das dívidas com confiança",
    tema: "Fundamentos Financeiros",
    duracao: "2h 50min",
    dificuldade: "Iniciante",
    cor: "#DC2626",
    desbloqueado: true,
    ordem: 2,
    modulos: [
      mod("Cartões de Crédito", [
        ["Como funcionam os cartões", "9 min"],
        ["Evitando a armadilha do mínimo", "11 min"],
      ]),
      mod("Taxas de Juros", [
        ["Entendendo o CET", "10 min"],
        ["Juros compostos contra você", "8 min"],
      ]),
      mod("Estratégias de Quitação", [
        ["Bola de Neve vs Avalanche", "12 min"],
        ["Negociando com credores", "9 min"],
      ]),
      mod("Recuperação Financeira", [["Reconstruindo seu score", "10 min"]]),
    ],
    questoes: [
      {
        enunciado: "O CET (Custo Efetivo Total) representa:",
        opcoes: [
          "Apenas a taxa de juros",
          "O custo total de uma operação, incluindo juros e tarifas",
          "O valor da parcela",
          "O limite do crédito",
        ],
        correta: 1,
      },
      {
        enunciado: "Na estratégia 'Avalanche', você quita primeiro:",
        opcoes: [
          "A dívida de menor valor",
          "A dívida com maior taxa de juros",
          "A dívida mais antiga",
          "A dívida mais recente",
        ],
        correta: 1,
      },
      {
        enunciado: "Pagar o mínimo do cartão de crédito é perigoso porque:",
        opcoes: [
          "Não pontua no programa de milhas",
          "Os juros do rotativo são muito altos",
          "Cancela o cartão",
          "Reduz o limite",
        ],
        correta: 1,
      },
      {
        enunciado: "Juros compostos contra você significam que:",
        opcoes: [
          "Sua dívida cresce mais rápido com o tempo",
          "Você ganha desconto",
          "O banco perde dinheiro",
          "Sua parcela diminui",
        ],
        correta: 0,
      },
      {
        enunciado: "Ao negociar com credores, o ideal é:",
        opcoes: [
          "Ignorar a cobrança",
          "Aceitar a primeira proposta",
          "Propor pagamento à vista com desconto",
          "Trocar de banco",
        ],
        correta: 2,
      },
    ],
  },
  {
    titulo: "Investimentos para Iniciantes",
    descricao: "Comece a investir com segurança e clareza",
    tema: "Construção de Patrimônio",
    duracao: "4h 10min",
    dificuldade: "Intermediário",
    cor: "#10B981",
    desbloqueado: true,
    ordem: 3,
    modulos: [
      mod("Renda Fixa", [
        ["O que é renda fixa?", "8 min"],
        ["CDB, LCI e LCA", "12 min"],
      ]),
      mod("Tesouro Direto", [
        ["Segurança garantida pelo governo", "10 min"],
        ["Escolhendo seu vencimento", "9 min"],
      ]),
      mod("Liquidez", [["Quando você precisa do dinheiro", "7 min"]]),
      mod("Gestão de Risco", [
        ["Risco vs Retorno", "11 min"],
        ["Seu perfil de investidor", "8 min"],
      ]),
    ],
    questoes: [
      {
        enunciado: "Renda fixa é caracterizada por:",
        opcoes: [
          "Rentabilidade conhecida ou previsível",
          "Ganhos garantidos altíssimos",
          "Risco zero absoluto",
          "Sem liquidez nunca",
        ],
        correta: 0,
      },
      {
        enunciado: "O Tesouro Direto é:",
        opcoes: [
          "Uma corretora",
          "Um programa de compra de títulos públicos pela internet",
          "Um banco digital",
          "Um fundo imobiliário",
        ],
        correta: 1,
      },
      {
        enunciado: "Liquidez de um investimento significa:",
        opcoes: [
          "Quanto rende ao ano",
          "Facilidade de transformar em dinheiro",
          "O imposto pago",
          "Tempo até o vencimento",
        ],
        correta: 1,
      },
      {
        enunciado: "CDB significa:",
        opcoes: [
          "Certificado de Depósito Bancário",
          "Conta Direta de Banco",
          "Crédito Direto ao Beneficiário",
          "Caderneta de Depósito Brasileira",
        ],
        correta: 0,
      },
      {
        enunciado: "Seu perfil de investidor serve para:",
        opcoes: [
          "Definir seu salário",
          "Indicar a tolerância ao risco e horizonte",
          "Limitar a quantidade de investimentos",
          "Calcular impostos",
        ],
        correta: 1,
      },
    ],
  },
  {
    titulo: "Construção de Patrimônio",
    descricao: "Use os juros compostos rumo à liberdade de longo prazo",
    tema: "Construção de Patrimônio",
    duracao: "5h 00min",
    dificuldade: "Intermediário",
    cor: "#7C3AED",
    desbloqueado: true,
    ordem: 4,
    modulos: [
      mod("Juros Compostos", [
        ["A 8ª maravilha do mundo", "10 min"],
        ["Tempo vs Valor aportado", "8 min"],
      ]),
      mod("Planejamento de Longo Prazo", [
        ["Definindo metas para 10 anos", "12 min"],
      ]),
      mod("Diversificação", [
        ["Não coloque todos os ovos na mesma cesta", "11 min"],
      ]),
      mod("Planejamento de Aposentadoria", [
        ["Calculando seu número mágico", "13 min"],
        ["Previdência e benefícios fiscais", "10 min"],
      ]),
    ],
    questoes: [
      {
        enunciado: "Juros compostos são poderosos principalmente por causa do:",
        opcoes: ["Valor inicial alto", "Tempo", "Risco baixo", "Imposto"],
        correta: 1,
      },
      {
        enunciado: "Diversificar a carteira significa:",
        opcoes: [
          "Investir tudo na mesma ação",
          "Distribuir entre diferentes ativos e classes",
          "Trocar de banco mensalmente",
          "Investir só no exterior",
        ],
        correta: 1,
      },
      {
        enunciado: "Planejamento de longo prazo deve considerar:",
        opcoes: [
          "Apenas o próximo mês",
          "Apenas inflação",
          "Metas, prazos, inflação e perfil de risco",
          "Apenas a aposentadoria",
        ],
        correta: 2,
      },
      {
        enunciado: "O 'número mágico' da aposentadoria é:",
        opcoes: [
          "A idade ideal para parar de trabalhar",
          "O patrimônio necessário para viver de renda",
          "Quanto gastar por mês",
          "O valor da previdência social",
        ],
        correta: 1,
      },
      {
        enunciado: "Aportes regulares (mensais) são importantes porque:",
        opcoes: [
          "Reduzem o efeito da volatilidade ao longo do tempo",
          "Garantem retorno fixo",
          "Eliminam impostos",
          "Substituem a reserva de emergência",
        ],
        correta: 0,
      },
    ],
  },
  {
    titulo: "Renda Extra e Negócios",
    descricao: "Crie novas fontes de renda além do salário",
    tema: "Liberdade Financeira",
    duracao: "4h 40min",
    dificuldade: "Avançado",
    cor: "#F97316",
    desbloqueado: false,
    ordem: 5,
    modulos: [
      mod("Trabalhos Paralelos", [["Validando sua ideia", "10 min"]]),
      mod("Negócio Digital", [["Construindo online", "12 min"]]),
      mod("Monetização", [["Precificando para lucrar", "9 min"]]),
      mod("Renda Ativa vs Passiva", [["Desenhando rendas passivas", "11 min"]]),
    ],
    questoes: [
      {
        enunciado: "Antes de investir tempo em um side business, é essencial:",
        opcoes: [
          "Comprar equipamento caro",
          "Validar a ideia com o público-alvo",
          "Pedir demissão do emprego",
          "Contratar funcionários",
        ],
        correta: 1,
      },
      {
        enunciado: "Renda passiva é aquela que:",
        opcoes: [
          "Exige seu tempo ativo todos os dias",
          "Continua gerando receita com pouco esforço contínuo",
          "Nunca varia",
          "Vem só de salário",
        ],
        correta: 1,
      },
      {
        enunciado: "Um negócio digital tem como principal vantagem:",
        opcoes: [
          "Escalabilidade com custo marginal baixo",
          "Não precisa de marketing",
          "Lucro garantido",
          "Não paga impostos",
        ],
        correta: 0,
      },
      {
        enunciado: "Precificar corretamente envolve considerar:",
        opcoes: [
          "Apenas o preço do concorrente",
          "Custos, valor entregue e mercado",
          "Apenas o quanto você quer ganhar",
          "O preço mais baixo possível",
        ],
        correta: 1,
      },
      {
        enunciado: "A diferença entre renda ativa e passiva é:",
        opcoes: [
          "Ativa exige troca direta de tempo por dinheiro",
          "Passiva é sempre maior",
          "Ativa não paga imposto",
          "Passiva é ilegal",
        ],
        correta: 0,
      },
    ],
  },
  {
    titulo: "Inteligência Financeira Avançada",
    descricao: "Otimize, proteja e escale seu patrimônio",
    tema: "Liberdade Financeira",
    duracao: "6h 20min",
    dificuldade: "Avançado",
    cor: "#1E3A5F",
    desbloqueado: false,
    ordem: 6,
    modulos: [
      mod("Planejamento Estratégico", [
        ["Estratégia macro de dinheiro", "14 min"],
      ]),
      mod("Otimização Tributária", [["Estratégias legais", "12 min"]]),
      mod("Alocação de Ativos", [["Teoria moderna do portfólio", "13 min"]]),
      mod("Proteção Patrimonial", [["Seguros e sucessão", "11 min"]]),
    ],
    questoes: [
      {
        enunciado: "Otimização tributária consiste em:",
        opcoes: [
          "Sonegar impostos",
          "Usar estratégias legais para pagar menos impostos",
          "Não declarar renda",
          "Mudar de país",
        ],
        correta: 1,
      },
      {
        enunciado: "Alocação de ativos significa:",
        opcoes: [
          "Comprar só ações",
          "Definir o percentual da carteira em cada classe de ativo",
          "Ter apenas renda fixa",
          "Investir conforme a moda",
        ],
        correta: 1,
      },
      {
        enunciado: "Proteção patrimonial inclui:",
        opcoes: [
          "Apenas seguros de carro",
          "Seguros, planejamento sucessório e estrutura jurídica",
          "Apenas testamento",
          "Apenas previdência privada",
        ],
        correta: 1,
      },
      {
        enunciado: "A Teoria Moderna do Portfólio defende:",
        opcoes: [
          "Maximizar retorno sem considerar risco",
          "Otimizar a relação risco x retorno via diversificação",
          "Investir tudo em um único ativo",
          "Evitar a bolsa",
        ],
        correta: 1,
      },
      {
        enunciado: "Planejamento sucessório é importante para:",
        opcoes: [
          "Reduzir impostos sobre herança e evitar conflitos",
          "Aumentar o salário",
          "Pagar menos no cartão",
          "Investir mais rápido",
        ],
        correta: 0,
      },
    ],
  },
];

const CONQUISTAS = [
  {
    titulo: "Primeira Faísca",
    preRequisito: "Conquiste seus primeiros 100 XP",
    qtdXpMinimo: 100,
  },
  {
    titulo: "Aprendiz Financeiro",
    preRequisito: "Acumule 300 XP estudando",
    qtdXpMinimo: 300,
  },
  { titulo: "Em Ritmo", preRequisito: "Alcance 600 XP", qtdXpMinimo: 600 },
  {
    titulo: "Estudante Dedicado",
    preRequisito: "Acumule 1.000 XP",
    qtdXpMinimo: 1000,
  },
  {
    titulo: "Investidor em Formação",
    preRequisito: "Alcance 1.500 XP",
    qtdXpMinimo: 1500,
  },
  {
    titulo: "Mestre do Conhecimento",
    preRequisito: "Acumule 2.000 XP",
    qtdXpMinimo: 2000,
  },
  {
    titulo: "Elite Financeira",
    preRequisito: "Alcance 3.000 XP",
    qtdXpMinimo: 3000,
  },
  {
    titulo: "Campeão de XP",
    preRequisito: "Conquiste 5.000 XP",
    qtdXpMinimo: 5000,
  },
  {
    titulo: "Lenda Financeira",
    preRequisito: "Acumule 10.000 XP",
    qtdXpMinimo: 10000,
  },
];

// --- Execução ------------------------------------------------------------

async function main() {
  console.log(
    "Seed de conteúdo educacional (portado do protótipo Lovable)...\n",
  );

  for (const cursoSeed of CURSOS) {
    const existente = await db.curso.findFirst({
      where: { titulo: cursoSeed.titulo },
    });
    if (existente) {
      console.log(`- Curso "${cursoSeed.titulo}" já existe, pulando.`);
      continue;
    }

    const tema = await db.temaCurso.findFirst({
      where: { titulo: cursoSeed.tema },
    });
    if (!tema) {
      console.warn(
        `! Tema "${cursoSeed.tema}" não encontrado — rode o seed principal (npm run db:seed) antes deste. Pulando curso "${cursoSeed.titulo}".`,
      );
      continue;
    }

    console.log(`+ Criando curso "${cursoSeed.titulo}"...`);

    const curso = await db.curso.create({
      data: {
        titulo: cursoSeed.titulo,
        descricao: cursoSeed.descricao,
        duracao: parseDuracao(cursoSeed.duracao),
        nivelEnsino: DIFICULDADE_PARA_NIVEL[cursoSeed.dificuldade],
        cor: cursoSeed.cor,
        desbloqueado: cursoSeed.desbloqueado,
        ordem: cursoSeed.ordem,
        temaCursoId: tema.id,
      },
    });

    let totalLicoesCurso = 0;
    let duracaoTotalCurso = 0;

    for (let i = 0; i < cursoSeed.modulos.length; i++) {
      const moduloSeed = cursoSeed.modulos[i];
      const modulo = await db.modulo.create({
        data: {
          titulo: moduloSeed.titulo,
          ordem: i + 1,
          desbloqueado: cursoSeed.desbloqueado,
          cursoId: curso.id,
        },
      });

      for (let j = 0; j < moduloSeed.licoes.length; j++) {
        const licaoSeed = moduloSeed.licoes[j];
        const duracaoMin = parseDuracao(licaoSeed.duracao);

        await db.licao.create({
          data: {
            titulo: licaoSeed.titulo,
            conteudo: conteudoPadrao(licaoSeed.titulo),
            resumo: resumoPadrao(licaoSeed.titulo),
            duracao: duracaoMin,
            ordem: j + 1,
            desbloqueado: cursoSeed.desbloqueado,
            cursoId: curso.id,
            moduloId: modulo.id,
          },
        });

        totalLicoesCurso += 1;
        duracaoTotalCurso += duracaoMin;
      }

      await db.licoesPorModulo.create({
        data: { moduloId: modulo.id, qtdLicoes: moduloSeed.licoes.length },
      });
    }

    await db.licoesPorCurso.create({
      data: {
        cursoId: curso.id,
        qtdLicoes: totalLicoesCurso,
        duracaoTotal: duracaoTotalCurso,
      },
    });

    const questionario = await db.questionario.create({
      data: {
        descricao: `Teste o que você aprendeu em ${cursoSeed.titulo} e ganhe XP extra.`,
        qtdQuestoes: cursoSeed.questoes.length,
        cursoId: curso.id,
      },
    });

    for (let k = 0; k < cursoSeed.questoes.length; k++) {
      const questaoSeed = cursoSeed.questoes[k];
      const questao = await db.questao.create({
        data: {
          enunciado: questaoSeed.enunciado,
          ativa: true,
          ordem: k + 1,
          questionarioId: questionario.id,
        },
      });

      for (let o = 0; o < questaoSeed.opcoes.length; o++) {
        await db.alternativa.create({
          data: {
            texto: questaoSeed.opcoes[o],
            correta: o === questaoSeed.correta,
            ordem: o + 1,
            questaoId: questao.id,
          },
        });
      }
    }

    console.log(
      `  -> ${cursoSeed.modulos.length} módulo(s), ${totalLicoesCurso} lição(ões), questionário com ${cursoSeed.questoes.length} questão(ões).`,
    );
  }

  console.log("\nSeed de conquistas...");
  for (const conquista of CONQUISTAS) {
    const existente = await db.conquista.findFirst({
      where: { titulo: conquista.titulo },
    });
    if (!existente) {
      await db.conquista.create({ data: conquista });
      console.log(`+ Conquista "${conquista.titulo}" criada.`);
    } else {
      console.log(`- Conquista "${conquista.titulo}" já existe, pulando.`);
    }
  }

  console.log("\nConcluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
