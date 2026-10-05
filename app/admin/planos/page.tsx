import { db } from "@/app/_lib/prisma";
import PageHeader from "../_components/PageHeader";
import PlanosManager from "./_components/PlanosManager";

const PlanosPage = async () => {
  const planos = await db.plano.findMany({
    include: { beneficios: true },
    orderBy: { ordem: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Planos"
        description="Planos de assinatura e seus benefícios"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Planos" }]}
      />
      {/* Decimal (valorMensal) não serializa direto para Client Component */}
      <PlanosManager planos={JSON.parse(JSON.stringify(planos))} />
    </div>
  );
};

export default PlanosPage;
