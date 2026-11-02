import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { db } from "@/app/_lib/prisma";
import {
  ACOES_AUDITORIA,
  type AcaoAuditoria,
} from "@/app/admin/_lib/acoes-auditoria";

// Registro de auditoria das ações do painel admin. A tabela só recebe
// inserts: nada aqui edita ou apaga registro.

const MAX_TEXTO = 200;
const MAX_ROTULO = 150;

// Deixa o valor seguro para virar JSON: corta textos longos (enunciados,
// descrições), troca Date por ISO e descarta `undefined`.
const limpar = (valor: unknown): Prisma.InputJsonValue | null => {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === "string") {
    return valor.length > MAX_TEXTO ? `${valor.slice(0, MAX_TEXTO)}…` : valor;
  }
  if (typeof valor === "number" || typeof valor === "boolean") return valor;
  if (valor instanceof Date) return valor.toISOString();
  if (Array.isArray(valor)) return valor.map((v) => limpar(v)) as never;
  if (typeof valor === "object") {
    const saida: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [k, v] of Object.entries(valor)) {
      if (v !== undefined) saida[k] = limpar(v);
    }
    return saida;
  }
  return String(valor);
};

// Compara "antes" e "depois" e devolve só o que mudou: { campo: { de, para } }.
// Se nada mudou, devolve undefined. Assim o log não guarda o registro inteiro.
export const diferenca = (
  antes: Record<string, unknown>,
  depois: Record<string, unknown>,
) => {
  const mudou: Record<string, { de: unknown; para: unknown }> = {};
  for (const campo of Object.keys(depois)) {
    const a =
      antes[campo] instanceof Date ? antes[campo].toISOString() : antes[campo];
    const d =
      depois[campo] instanceof Date
        ? depois[campo].toISOString()
        : depois[campo];
    if (JSON.stringify(a ?? null) !== JSON.stringify(d ?? null)) {
      mudou[campo] = { de: antes[campo], para: depois[campo] };
    }
  }
  return Object.keys(mudou).length ? mudou : undefined;
};

export interface EntradaAuditoria {
  acao: AcaoAuditoria;
  alvoTipo?: string | null;
  alvoId?: string | null;
  alvoRotulo?: string | null;
  detalhes?: unknown;
  sucesso?: boolean;
  erro?: string | null;
}

// Grava uma linha de auditoria para o admin que está logado. Se falhar, só
// avisa no console: perder um log não pode derrubar a ação que o admin fez.
export const registrarAuditoria = async (entrada: EntradaAuditoria) => {
  try {
    const admin = await currentUser();
    if (!admin) return; // sem login não há quem registrar

    const email = admin.emailAddresses.find(
      (e) => e.id === admin.primaryEmailAddressId,
    )?.emailAddress;
    const nome =
      [admin.firstName, admin.lastName].filter(Boolean).join(" ") || null;

    const registro = await db.usuario.findUnique({
      where: { clerkId: admin.id },
      select: { id: true },
    });

    const detalhes = limpar(entrada.detalhes);
    const rotulo = entrada.alvoRotulo
      ? entrada.alvoRotulo.slice(0, MAX_ROTULO)
      : null;
    const descricao = rotulo
      ? `${ACOES_AUDITORIA[entrada.acao]}: ${rotulo}`
      : ACOES_AUDITORIA[entrada.acao];

    await db.auditoria.create({
      data: {
        descricao,
        acao: entrada.acao,
        alvoTipo: entrada.alvoTipo ?? null,
        alvoId: entrada.alvoId ?? null,
        alvoRotulo: rotulo,
        detalhes: detalhes === null ? Prisma.DbNull : detalhes,
        sucesso: entrada.sucesso ?? true,
        erro: entrada.erro ?? null,
        adminClerkId: admin.id,
        adminEmail: email ?? null,
        adminNome: nome,
        usuarioId: registro?.id ?? null,
      },
    });
  } catch (error) {
    console.error("Falha ao gravar auditoria:", error);
  }
};
