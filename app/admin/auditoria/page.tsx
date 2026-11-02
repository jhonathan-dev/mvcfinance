import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Prisma } from "@prisma/client";
import { db } from "@/app/_lib/prisma";
import { exigirAdminNaPagina } from "@/app/_lib/admin";
import { inicioDoDia, inicioDoDiaSeguinte } from "@/app/_lib/periodo";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import PageHeader from "../_components/PageHeader";
import DetalhesAuditoria from "./_components/DetalhesAuditoria";
import {
  ACOES_AUDITORIA,
  ENTIDADES_AUDITORIA,
  entidadeDaAcao,
  rotuloDaAcao,
} from "../_lib/acoes-auditoria";

const POR_PAGINA = 20;

const formatarDataHora = (data: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(data);

const dataValida = (valor?: string) => {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return undefined;
  return Number.isNaN(inicioDoDia(valor).getTime()) ? undefined : valor;
};

interface AuditoriaPageProps {
  searchParams: {
    acao?: string;
    admin?: string;
    resultado?: string;
    de?: string;
    ate?: string;
    pagina?: string;
  };
}

const classeDoSelect =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const AuditoriaPage = async ({ searchParams }: AuditoriaPageProps) => {
  await exigirAdminNaPagina();

  // Tudo que vem da URL é validado: valor inválido é simplesmente ignorado.
  const acao =
    searchParams.acao && searchParams.acao in ACOES_AUDITORIA
      ? searchParams.acao
      : undefined;
  const admin = (searchParams.admin ?? "").trim().slice(0, 100) || undefined;
  const resultado =
    searchParams.resultado === "sucesso" || searchParams.resultado === "falha"
      ? searchParams.resultado
      : undefined;
  let de = dataValida(searchParams.de);
  let ate = dataValida(searchParams.ate);
  if (de && ate && de > ate) [de, ate] = [ate, de];
  const paginaPedida = Number.parseInt(searchParams.pagina ?? "1", 10);
  const paginaDesejada =
    Number.isFinite(paginaPedida) && paginaPedida > 0 ? paginaPedida : 1;

  const where: Prisma.AuditoriaWhereInput = {
    ...(acao && { acao }),
    ...(admin && { adminClerkId: admin }),
    ...(resultado && { sucesso: resultado === "sucesso" }),
    ...((de || ate) && {
      criadoEm: {
        ...(de && { gte: inicioDoDia(de) }),
        ...(ate && { lt: inicioDoDiaSeguinte(ate) }),
      },
    }),
  };

  const [total, admins] = await Promise.all([
    db.auditoria.count({ where }),
    db.auditoria.findMany({
      where: { adminClerkId: { not: null } },
      distinct: ["adminClerkId"],
      orderBy: { criadoEm: "desc" },
      select: { adminClerkId: true, adminEmail: true, adminNome: true },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(paginaDesejada, totalPaginas);

  const registros = await db.auditoria.findMany({
    where,
    orderBy: [{ criadoEm: "desc" }, { id: "asc" }],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
  });

  const link = (p: number) => {
    const params = new URLSearchParams();
    if (acao) params.set("acao", acao);
    if (admin) params.set("admin", admin);
    if (resultado) params.set("resultado", resultado);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    if (p > 1) params.set("pagina", String(p));
    const query = params.toString();
    return query ? `/admin/auditoria?${query}` : "/admin/auditoria";
  };

  const filtrando = Boolean(acao || admin || resultado || de || ate);

  // Ações agrupadas por entidade, para o <select> não virar uma lista gigante.
  const grupos = Object.entries(ENTIDADES_AUDITORIA).map(([chave, titulo]) => ({
    titulo,
    acoes: Object.entries(ACOES_AUDITORIA).filter(
      ([codigo]) => entidadeDaAcao(codigo) === chave,
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Auditoria"
        description="Histórico das ações feitas no painel administrativo. Somente leitura."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Auditoria" }]}
      />

      <form
        action="/admin/auditoria"
        method="get"
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Ação
          </label>
          <select
            name="acao"
            defaultValue={acao ?? ""}
            className={classeDoSelect}
          >
            <option value="">Todas</option>
            {grupos.map((g) => (
              <optgroup key={g.titulo} label={g.titulo}>
                {g.acoes.map(([codigo, rotulo]) => (
                  <option key={codigo} value={codigo}>
                    {rotulo}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Administrador
          </label>
          <select
            name="admin"
            defaultValue={admin ?? ""}
            className={classeDoSelect}
          >
            <option value="">Todos</option>
            {admins.map((a) => (
              <option key={a.adminClerkId} value={a.adminClerkId ?? ""}>
                {a.adminNome ?? a.adminEmail ?? a.adminClerkId}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Resultado
          </label>
          <select
            name="resultado"
            defaultValue={resultado ?? ""}
            className={classeDoSelect}
          >
            <option value="">Todos</option>
            <option value="sucesso">Sucesso</option>
            <option value="falha">Falha</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">De</label>
          <Input type="date" name="de" defaultValue={de ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Até
          </label>
          <Input type="date" name="ate" defaultValue={ate ?? ""} />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          {filtrando && (
            <Button asChild variant="ghost">
              <Link href="/admin/auditoria">Limpar</Link>
            </Button>
          )}
        </div>
      </form>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Data e hora</TableHead>
              <TableHead>Administrador</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  {filtrando
                    ? "Nenhum registro encontrado com esses filtros."
                    : "Ainda não há ações registradas."}
                </TableCell>
              </TableRow>
            ) : (
              registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap align-top text-sm">
                    {formatarDataHora(r.criadoEm)}
                  </TableCell>
                  <TableCell className="align-top text-sm">
                    <div className="font-medium">
                      {r.adminNome ?? r.adminEmail ?? "—"}
                    </div>
                    {r.adminNome && r.adminEmail && (
                      <div className="text-xs text-muted-foreground">
                        {r.adminEmail}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{r.descricao}</span>
                      {!r.sucesso && (
                        <Badge variant="destructive">
                          {r.acao === "acesso.negado" ? "Negado" : "Falhou"}
                        </Badge>
                      )}
                    </div>
                    {r.acao === "legado" && (
                      <div className="text-xs text-muted-foreground">
                        {rotuloDaAcao(r.acao)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <DetalhesAuditoria
                      alvoTipo={r.alvoTipo}
                      alvoId={r.alvoId}
                      erro={r.erro}
                      detalhes={r.detalhes}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "registro" : "registros"}
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
    </div>
  );
};

export default AuditoriaPage;
