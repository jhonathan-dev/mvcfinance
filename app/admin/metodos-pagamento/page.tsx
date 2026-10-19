import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import MetodosManager from "./_components/MetodosManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const MetodosPagamentoPage = async () => {
  await exigirAdminNaPagina();
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
