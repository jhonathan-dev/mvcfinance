import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { db } from "@/app/_lib/prisma";
import { exigirAdminNaPagina, ROLE_ADMIN } from "@/app/_lib/admin";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import PageHeader from "../_components/PageHeader";
import UsuariosManager from "./_components/UsuariosManager";
import { ConviteLinha, UsuarioLinha } from "./_components/tipos";

const POR_PAGINA = 20;

const formatarData = (ms: number | null | undefined) =>
  ms
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(ms))
    : null;

interface UsuariosPageProps {
  searchParams: { q?: string; pagina?: string };
}

const UsuariosPage = async ({ searchParams }: UsuariosPageProps) => {
  await exigirAdminNaPagina();
  const { userId: meuId } = await auth();

  const busca = (searchParams.q ?? "").trim().slice(0, 100);
  const paginaPedida = Number.parseInt(searchParams.pagina ?? "1", 10);
  const pagina =
    Number.isFinite(paginaPedida) && paginaPedida > 0 ? paginaPedida : 1;

  const link = (p: number) => {
    const params = new URLSearchParams();
    if (busca) params.set("q", busca);
    if (p > 1) params.set("pagina", String(p));
    const query = params.toString();
    return query ? `/admin/usuarios?${query}` : "/admin/usuarios";
  };

  let usuarios: UsuarioLinha[] = [];
  let convites: ConviteLinha[] = [];
  let total = 0;
  let erroDoClerk = false;

  try {
    const clerk = clerkClient();
    const [lista, pendentes] = await Promise.all([
      clerk.users.getUserList({
        query: busca || undefined,
        limit: POR_PAGINA,
        offset: (pagina - 1) * POR_PAGINA,
        orderBy: "-created_at",
      }),
      clerk.invitations.getInvitationList({ status: "pending", limit: 50 }),
    ]);
    total = lista.totalCount;

    // Se a página pedida não existe mais (ex.: usuários foram excluídos),
    // volta para a última.
    if (lista.data.length === 0 && pagina > 1 && total > 0) {
      redirect(link(Math.ceil(total / POR_PAGINA)));
    }

    // Dados do nosso banco, cruzados pelo id do Clerk.
    const ids = lista.data.map((u) => u.id);
    const [doBanco, operacoes] = await Promise.all([
      db.usuario.findMany({
        where: { clerkId: { in: ids } },
        select: { id: true, clerkId: true, totalXp: true },
      }),
      db.operacao.groupBy({
        by: ["usuarioId"],
        where: { usuarioId: { in: ids } },
        _count: { _all: true },
      }),
    ]);
    const concluidos = await db.calculoDeProgresso.groupBy({
      by: ["usuarioId"],
      where: {
        cursoConcluido: true,
        usuarioId: { in: doBanco.map((u) => u.id) },
      },
      _count: { _all: true },
    });

    const porClerkId = new Map(doBanco.map((u) => [u.clerkId, u]));
    const cursosPorUsuario = new Map(
      concluidos.map((c) => [c.usuarioId, c._count._all]),
    );
    const operacoesPorUsuario = new Map(
      operacoes.map((o) => [o.usuarioId, o._count._all]),
    );

    usuarios = lista.data.map((u) => {
      const registro = porClerkId.get(u.id);
      const email =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
          ?.emailAddress ??
        u.emailAddresses[0]?.emailAddress ??
        "";
      const nome =
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        email ||
        "Sem nome";
      return {
        id: u.id,
        nome,
        email,
        imagem: u.imageUrl,
        admin: u.publicMetadata?.role === ROLE_ADMIN,
        premium: u.publicMetadata?.subscriptionPlan === "premium",
        banido: u.banned,
        bloqueado: u.locked,
        cadastro: formatarData(u.createdAt) ?? "-",
        ultimoAcesso: formatarData(u.lastActiveAt ?? u.lastSignInAt),
        xp: registro?.totalXp ?? null,
        cursosConcluidos: registro
          ? (cursosPorUsuario.get(registro.id) ?? 0)
          : 0,
        operacoes: operacoesPorUsuario.get(u.id) ?? 0,
        ehVoce: u.id === meuId,
      };
    });

    convites = pendentes.data.map((c) => ({
      id: c.id,
      email: c.emailAddress,
      admin: c.publicMetadata?.role === ROLE_ADMIN,
      enviadoEm: formatarData(c.createdAt) ?? "-",
    }));
  } catch (error) {
    // O redirect do Next também é uma "exceção": precisa continuar subindo.
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error(error);
    erroDoClerk = true;
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Contas cadastradas no Clerk, com o progresso de cada pessoa no sistema"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Usuários" }]}
      />

      <form action="/admin/usuarios" method="get" className="mb-6 flex gap-2">
        <Input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome ou e-mail..."
          className="max-w-sm"
          maxLength={100}
        />
        <Button type="submit" variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
        {busca && (
          <Button asChild variant="ghost">
            <Link href="/admin/usuarios">Limpar</Link>
          </Button>
        )}
      </form>

      {erroDoClerk ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Não foi possível carregar os usuários do Clerk agora. Verifique a
          conexão e a CLERK_SECRET_KEY e atualize a página.
        </Card>
      ) : (
        <>
          <UsuariosManager usuarios={usuarios} convites={convites} />

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "usuário" : "usuários"}
              {busca ? ` para "${busca}"` : ""}
            </p>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  asChild={pagina > 1}
                  variant="outline"
                  size="sm"
                  disabled={pagina <= 1}
                >
                  {pagina > 1 ? (
                    <Link href={link(pagina - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </span>
                  )}
                </Button>
                <span className="text-sm">
                  Página {pagina} de {totalPaginas}
                </span>
                <Button
                  asChild={pagina < totalPaginas}
                  variant="outline"
                  size="sm"
                  disabled={pagina >= totalPaginas}
                >
                  {pagina < totalPaginas ? (
                    <Link href={link(pagina + 1)}>
                      Próxima
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Próxima
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UsuariosPage;
