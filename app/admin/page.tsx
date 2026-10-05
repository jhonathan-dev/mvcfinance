import Link from "next/link";
import { db } from "../_lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card";
import { FolderTree, Tags, CreditCard, BookOpen } from "lucide-react";
import PageHeader from "./_components/PageHeader";

const AdminDashboard = async () => {
  const [cursos, temas, categoriasAtivas, metodosAtivos] = await Promise.all([
    db.curso.count(),
    db.temaCurso.count(),
    db.categoria.count({ where: { ativo: true } }),
    db.metodoPagamento.count({ where: { ativo: true } }),
  ]);

  const stats = [
    {
      label: "Cursos",
      value: cursos,
      icon: BookOpen,
      href: "/admin/cursos",
      color: "text-blue-600",
    },
    {
      label: "Temas de Curso",
      value: temas,
      icon: FolderTree,
      href: "/admin/temas",
      color: "text-purple-600",
    },
    {
      label: "Categorias Ativas",
      value: categoriasAtivas,
      icon: Tags,
      href: "/admin/categorias",
      color: "text-emerald-600",
    },
    {
      label: "Métodos Ativos",
      value: metodosAtivos,
      icon: CreditCard,
      href: "/admin/metodos-pagamento",
      color: "text-amber-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do painel administrativo"
        crumbs={[{ label: "Admin" }]}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Módulos e Lições já são gerenciados dentro de cada curso. Questionário,
        Conquistas e Planos entram no painel em uma próxima etapa.
      </p>
    </div>
  );
};

export default AdminDashboard;
