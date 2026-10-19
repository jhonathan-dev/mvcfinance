import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TotalPorCategoria } from "@/app/_data/get-dashboard/types";

interface ExpensesPerCategoryProps {
  totalPorCategoria: TotalPorCategoria[];
}

const ExpensesPerCategory = ({
  totalPorCategoria,
}: ExpensesPerCategoryProps) => {
  // Mesmo padrão de "Últimas Operações": ScrollArea solto num wrapper.
  return (
    <div className="relative col-span-2 min-h-[240px]">
      <ScrollArea className="absolute inset-0 rounded-md border pb-6">
        <CardHeader>
          <CardTitle className="font-bold">Gastos por Categoria</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {totalPorCategoria.map((categoria) => (
            <div key={categoria.categoriaId} className="space-y-2">
              <div className="flex w-full justify-between">
                <p className="text-sm font-bold">{categoria.categoriaNome}</p>
                <p className="text-sm font-bold">
                  {categoria.percentualDoTotal}%
                </p>
              </div>
              <Progress value={categoria.percentualDoTotal} />
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </div>
  );
};

export default ExpensesPerCategory;
