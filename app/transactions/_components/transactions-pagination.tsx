"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

interface TransactionsPaginationProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  porPagina: number;
}

const TransactionsPagination = ({
  pagina,
  totalPaginas,
  total,
  porPagina,
}: TransactionsPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const irParaPagina = (nova: number) => {
    // Mantém todos os filtros que já estão na URL.
    const params = new URLSearchParams(searchParams.toString());
    if (nova <= 1) params.delete("pagina");
    else params.set("pagina", String(nova));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex shrink-0 flex-col items-center justify-between gap-3 border-t bg-background px-6 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Nenhuma operação encontrada"
          : `Mostrando ${inicio}–${fim} de ${total} ${total === 1 ? "operação" : "operações"}`}
      </p>
      {
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => irParaPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
          >
            Próxima
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      }
    </div>
  );
};

export default TransactionsPagination;
