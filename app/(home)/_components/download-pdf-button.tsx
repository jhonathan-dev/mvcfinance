import { FileDownIcon } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { doisDigitos } from "@/app/_lib/periodo";

interface DownloadPdfButtonProps {
  mes: number; // 1-12
  ano: number;
}

// Relatório "padrão" em PDF do mês e ano que estão selecionados no Dashboard.
// Diferente do Relatório IA (premium), ele não usa inteligência artificial:
// traz o resumo do mês e a lista completa das operações.
const DownloadPdfButton = ({ mes, ano }: DownloadPdfButtonProps) => (
  <Button variant="ghost" asChild>
    <a
      href={`/transactions/relatorio?mes=${ano}-${doisDigitos(mes)}&formato=pdf`}
      title="Baixar em PDF o resumo e todas as operações do mês selecionado"
    >
      Relatório PDF
      <FileDownIcon />
    </a>
  </Button>
);

export default DownloadPdfButton;
