import { UserButton } from "@clerk/nextjs";
import { Settings, ArrowDownUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="flex h-full w-64 flex-col border-r border-border bg-card px-4 py-8">
        {/* Logo */}
        <div className="mb-10 px-2">
          <Image
            src="/logo_mvc.png"
            alt="MVC Finance"
            width={140}
            height={40}
            className="object-contain"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Controle financeiro
          </p>
        </div>
        {/* Navegação */}
        <nav className="flex flex-col gap-1">
          <Link
            href="/operations"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowDownUp className="h-4 w-4" />
            Operações
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </nav>

        {/* User no rodapé */}
        <div className="mt-auto flex items-center gap-3 px-2">
          <UserButton />
          <span className="text-sm text-muted-foreground">Minha conta</span>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
