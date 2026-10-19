"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, GraduationCap, Trophy, Crown } from "lucide-react";

const items = [
  { href: "/aprender", label: "Painel", icon: LayoutGrid, exact: true },
  { href: "/cursos", label: "Cursos", icon: GraduationCap },
  { href: "/conquistas", label: "Conquistas", icon: Trophy },
];

const AprenderSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="px-6 pb-2 pt-5 text-xs font-semibold uppercase text-muted-foreground">
        Aprender
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
      <div className="p-3">
        <Link
          href="/subscription"
          className="block rounded-xl bg-[#050E48] p-4 text-white transition-opacity hover:opacity-90"
        >
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <Crown className="h-3.5 w-3.5" /> Plano Premium
          </p>
          <p className="mt-1 text-sm font-semibold">
            Veja os planos disponíveis
          </p>
        </Link>
      </div>
    </aside>
  );
};

export default AprenderSidebar;
