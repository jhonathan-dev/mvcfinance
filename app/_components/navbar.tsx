"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  // Só esconde/mostra o link. Quem realmente barra o acesso é o servidor
  // (app/_lib/admin.ts) — este valor é só para a tela ficar limpa.
  const admin = user?.publicMetadata?.role === "admin";
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {/* ESQUERDA */}
      <div className="flex items-center gap-10">
        <Image src="/logo_mvc.png" width={173} height={39} alt="MVC Finance" />
        <Link
          href="/"
          className={
            pathname === "/"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={
            pathname === "/transactions"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Transações
        </Link>
        <Link
          href="/aprender"
          className={
            pathname.startsWith("/aprender") ||
            pathname.startsWith("/cursos") ||
            pathname.startsWith("/conquistas")
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Aprender
        </Link>
        <Link
          href="/subscription"
          className={
            pathname === "/subscription"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Assinatura
        </Link>
      </div>
      {/* DIREITA */}
      <div className="flex items-center gap-4">
        {admin && (
          <Link
            href="/admin"
            className={
              pathname.startsWith("/admin")
                ? "font-bold text-primary"
                : "text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Admin
          </Link>
        )}
        <UserButton showName />
      </div>
    </nav>
  );
};

export default Navbar;
