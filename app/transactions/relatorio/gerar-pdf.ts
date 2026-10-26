import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Dados já "mastigados" pela rota; este arquivo só desenha o PDF.
export interface LinhaRelatorio {
  data: string;
  nome: string;
  tipo: string;
  categoria: string;
  metodo: string;
  valor: number;
}

export interface DadosRelatorio {
  ano: number;
  mes: number; // 1-12
  operacoes: LinhaRelatorio[];
  totais: { depositos: number; despesas: number; investimentos: number };
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// "R$ 1.234,56" (troca o espaço "especial" do Intl por um espaço comum).
export const moedaBr = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(valor)
    .replace(/ /g, " ");

// As fontes padrão do PDF só têm caracteres latinos (acentos funcionam).
// Emojis e alfabetos que elas não têm sairiam como lixo, então são removidos.
export const textoParaPdf = (texto: string) =>
  texto
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^ -~¡-ÿ]/g, "")
    .trim();

const AZUL: [number, number, number] = [29, 78, 216];
const VERDE: [number, number, number] = [22, 163, 74];
const VERMELHO: [number, number, number] = [220, 38, 38];
const CINZA: [number, number, number] = [71, 85, 105];

export const gerarPdfRelatorio = ({
  ano,
  mes,
  operacoes,
  totais,
}: DadosRelatorio): ArrayBuffer => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();
  const margem = 14;
  const saldo = totais.depositos - totais.despesas - totais.investimentos;
  const nomeMes = `${MESES[mes - 1]} de ${ano}`;

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...AZUL);
  doc.text("MVC Finance", margem, 20);
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(`Relatório de operações - ${nomeMes}`, margem, 29);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text(
    `Gerado em ${new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date())}`,
    margem,
    35,
  );

  // Resumo
  autoTable(doc, {
    startY: 40,
    margin: { left: margem, right: margem },
    head: [["Depósitos", "Despesas", "Investimentos", "Saldo do mês"]],
    body: [
      [
        moedaBr(totais.depositos),
        moedaBr(totais.despesas),
        moedaBr(totais.investimentos),
        moedaBr(saldo),
      ],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 11,
      halign: "center",
      cellPadding: 3,
    },
    headStyles: { fillColor: AZUL, textColor: 255, fontSize: 9 },
    didParseCell: (dados) => {
      if (dados.section !== "body") return;
      dados.cell.styles.fontStyle = "bold";
      if (dados.column.index === 0) dados.cell.styles.textColor = VERDE;
      if (dados.column.index === 1) dados.cell.styles.textColor = VERMELHO;
      if (dados.column.index === 3) {
        dados.cell.styles.textColor = saldo < 0 ? VERMELHO : VERDE;
      }
    },
  });

  // Tabela de operações
  const finalDoResumo =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Operações (${operacoes.length})`, margem, finalDoResumo + 10);

  if (operacoes.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...CINZA);
    doc.text(
      "Nenhuma operação registrada neste mês.",
      margem,
      finalDoResumo + 18,
    );
  } else {
    autoTable(doc, {
      startY: finalDoResumo + 13,
      margin: { left: margem, right: margem, bottom: 16 },
      head: [["Data", "Nome", "Tipo", "Categoria", "Pagamento", "Valor"]],
      body: operacoes.map((o) => [
        o.data,
        textoParaPdf(o.nome),
        textoParaPdf(o.tipo),
        textoParaPdf(o.categoria),
        textoParaPdf(o.metodo),
        moedaBr(o.valor),
      ]),
      theme: "striped",
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: AZUL, textColor: 255 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: {
        0: { cellWidth: 22 },
        5: { halign: "right", cellWidth: 28 },
      },
      didParseCell: (dados) => {
        // Cabeçalho "Valor" alinhado à direita, como os números.
        if (dados.section === "head" && dados.column.index === 5) {
          dados.cell.styles.halign = "right";
        }
        if (dados.section !== "body" || dados.column.index !== 2) return;
        const tipo = String(dados.cell.raw);
        if (tipo === "Depósito") dados.cell.styles.textColor = VERDE;
        if (tipo === "Despesa") dados.cell.styles.textColor = VERMELHO;
      },
    });
  }

  // Rodapé com numeração em todas as páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...CINZA);
    doc.text("MVC Finance - Relatório de operações", margem, alturaPagina - 8);
    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      larguraPagina - margem,
      alturaPagina - 8,
      { align: "right" },
    );
  }

  return doc.output("arraybuffer");
};
