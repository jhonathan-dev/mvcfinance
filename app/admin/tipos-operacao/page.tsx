import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import TiposOperacaoManager from "./_components/TiposOperacaoManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const TiposOperacaoPage = async () => {
  await exigirAdminNaPagina();
  const tipos = await db.tipoOperacao.findMany({ orderBy: { tipo: "asc" } });

  return (
    <div>
      <PageHeader
        title="Tipos de Operação"
        description="Depósito, Despesa, Investimento — e qualquer outro tipo que vocês queiram adicionar"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tipos de Operação" },
        ]}
      />
      <TiposOperacaoManager tipos={tipos} />
    </div>
  );
};

export default TiposOperacaoPage;
