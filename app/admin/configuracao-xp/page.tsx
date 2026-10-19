import PageHeader from "../_components/PageHeader";
import { getConstantesXP } from "../_actions/constantes-xp";
import ConfiguracaoXPForm from "./_components/ConfiguracaoXPForm";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const ConfiguracaoXPPage = async () => {
  await exigirAdminNaPagina();
  const constantes = await getConstantesXP();

  return (
    <div>
      <PageHeader
        title="Configuração de XP"
        description="Valores padrão de XP concedidos ao concluir um curso, uma lição ou um questionário"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Configuração de XP" },
        ]}
      />
      <ConfiguracaoXPForm constantes={constantes} />
    </div>
  );
};

export default ConfiguracaoXPPage;
