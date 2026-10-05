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
  return (
    <ScrollArea className="col-span-2 h-full rounded-md border pb-6">
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
  );
};

export default ExpensesPerCategory;
