import { db } from "@/app/_lib/prisma";
import Link from "next/link";
import PageHeader from "../_components/PageHeader";
import CursosManager from "./_components/CursosManager";
import { exigirAdminNaPagina } from "@/app/_lib/admin";

const CursosPage = async () => {
  await exigirAdminNaPagina();
  const [cursos, temas] = await Promise.all([
    db.curso.findMany({
      include: {
        temaCurso: true,
        _count: { select: { modulos: true, licoes: true } },
      },
      orderBy: [{ temaCurso: { ordem: "asc" } }, { ordem: "asc" }],
    }),
    db.temaCurso.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Cursos"
        description="Cadastre os cursos do módulo de educação financeira"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Cursos" }]}
      />

      {temas.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum tema de curso cadastrado ainda. Crie um{" "}
          <Link
            href="/admin/temas"
            className="font-medium text-primary underline"
          >
            Tema de Curso
          </Link>{" "}
          antes de cadastrar cursos.
        </div>
      ) : (
        <CursosManager cursos={cursos} temas={temas} />
      )}
    </div>
  );
};

export default CursosPage;
