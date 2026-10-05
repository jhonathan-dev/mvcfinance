import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import MetodosManager from "./_components/MetodosManager";

const MetodosPagamentoPage = async () => {
  const metodos = await db.metodoPagamento.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Métodos de Pagamento"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Métodos de Pagamento" },
        ]}
      />
      <MetodosManager metodos={metodos} />
    </div>
  );
};

export default MetodosPagamentoPage;
