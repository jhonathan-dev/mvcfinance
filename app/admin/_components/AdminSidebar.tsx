"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Tags,
  CreditCard,
  BookOpen,
  Trophy,
  Sparkles,
  Shapes,
  ArrowLeft,
  Users,
  ScrollText,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/temas", label: "Temas de Curso", icon: FolderTree },
  { href: "/admin/conquistas", label: "Conquistas", icon: Trophy },
  {
    href: "/admin/configuracao-xp",
    label: "Configuração de XP",
    icon: Sparkles,
  },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/auditoria", label: "Auditoria", icon: ScrollText },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/tipos-operacao", label: "Tipos de Operação", icon: Shapes },
  {
    href: "/admin/metodos-pagamento",
    label: "Métodos de Pagamento",
    icon: CreditCard,
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="px-6 pb-2 pt-5 text-xs font-semibold uppercase text-muted-foreground">
        Painel Admin
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao sistema
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
