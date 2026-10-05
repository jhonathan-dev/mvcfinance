import Link from "next/link";
import { db } from "../_lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card";
import {
  FolderTree,
  Tags,
  CreditCard,
  BookOpen,
  Trophy,
  Wallet,
  Shapes,
} from "lucide-react";
import PageHeader from "./_components/PageHeader";

const AdminDashboard = async () => {
  const [
    cursos,
    temas,
    conquistas,
    planosAtivos,
    categoriasAtivas,
    tiposAtivos,
    metodosAtivos,
  ] = await Promise.all([
    db.curso.count(),
    db.temaCurso.count(),
    db.conquista.count(),
    db.plano.count({ where: { ativo: true } }),
    db.categoria.count({ where: { ativo: true } }),
    db.tipoOperacao.count({ where: { ativo: true } }),
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
      label: "Conquistas",
      value: conquistas,
      icon: Trophy,
      href: "/admin/conquistas",
      color: "text-yellow-600",
    },
    {
      label: "Planos Ativos",
      value: planosAtivos,
      icon: Wallet,
      href: "/admin/planos",
      color: "text-rose-600",
    },
    {
      label: "Categorias Ativas",
      value: categoriasAtivas,
      icon: Tags,
      href: "/admin/categorias",
      color: "text-emerald-600",
    },
    {
      label: "Tipos de Operação Ativos",
      value: tiposAtivos,
      icon: Shapes,
      href: "/admin/tipos-operacao",
      color: "text-cyan-600",
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
        Módulos, Lições e Questionário são gerenciados dentro de cada curso
        (botões na listagem de Cursos). A Configuração de XP fica em{" "}
        <Link
          href="/admin/configuracao-xp"
          className="font-medium text-primary underline"
        >
          Configuração de XP
        </Link>
        .
      </p>
    </div>
  );
};

export default AdminDashboard;
