import { db } from "@/app/_lib/prisma";
import type { Prisma } from "@prisma/client";
import { ErroDeNegocio } from "./resultado";

type Cliente = Prisma.TransactionClient;

// Mínimo de questões ativas para um quiz fazer sentido com a nota de corte de
// 60% (com 1 ou 2 questões a porcentagem fica degenerada: 50% ou 100%).
export const MIN_QUESTOES_ATIVAS = 3;

type Problema = { chave: string; texto: string };

// O que um curso precisa ter para ficar disponível ("desbloqueado") para os
// alunos sem travá-los: um curso vazio, um módulo vazio ou um quiz sem
// questões suficientes deixa o aluno preso (ele nunca consegue "finalizar" o
// curso e, com isso, nunca libera o curso seguinte).
//
// `completo = true` (ao desbloquear) também cobra módulos sem lição. Ao editar
// um curso que JÁ está no ar (`completo = false`) só barramos o que deixa o
// aluno preso ou o curso sem sentido — assim dá para, por exemplo, adicionar
// um módulo novo e já ir cadastrando as lições dele.
const levantarProblemas = async (
  client: Cliente,
  cursoId: string,
  completo: boolean,
): Promise<Problema[]> => {
  const curso = await client.curso.findUnique({
    where: { id: cursoId },
    select: {
      modulos: {
        select: {
          id: true,
          titulo: true,
          _count: { select: { licoes: true } },
        },
      },
      questionario: {
        select: {
          questoes: {
            where: { ativa: true },
            select: { alternativas: { select: { correta: true } } },
          },
        },
      },
    },
  });
  if (!curso) return [];

  const problemas: Problema[] = [];

  if (curso.modulos.length === 0) {
    problemas.push({ chave: "SEM_MODULO", texto: "falta pelo menos 1 módulo" });
  }
  if (completo) {
    curso.modulos
      .filter((m) => m._count.licoes === 0)
      .forEach((m) =>
        problemas.push({
          chave: `MODULO_VAZIO:${m.id}`,
          texto: `o módulo "${m.titulo}" não tem nenhuma lição`,
        }),
      );
  } else if (
    curso.modulos.length > 0 &&
    curso.modulos.every((m) => m._count.licoes === 0)
  ) {
    problemas.push({ chave: "SEM_LICAO", texto: "falta pelo menos 1 lição" });
  }

  if (curso.questionario) {
    const ativas = curso.questionario.questoes;
    if (ativas.length < MIN_QUESTOES_ATIVAS) {
      problemas.push({
        chave: "POUCAS_QUESTOES",
        texto: `o questionário precisa de pelo menos ${MIN_QUESTOES_ATIVAS} questões ativas (hoje tem ${ativas.length})`,
      });
    }
    const invalidas = ativas.filter(
      (q) =>
        q.alternativas.length < 2 ||
        q.alternativas.filter((a) => a.correta).length !== 1,
    );
    if (invalidas.length > 0) {
      problemas.push({
        chave: "ALTERNATIVAS_INVALIDAS",
        texto:
          "há questões ativas sem 2+ alternativas ou sem exatamente 1 correta",
      });
    }
  }

  return problemas;
};

// Usada ao DESBLOQUEAR um curso: se estiver incompleto, recusa e explica o que falta.
export const exigirCursoPublicavel = async (
  client: Cliente,
  cursoId: string,
) => {
  const problemas = await levantarProblemas(client, cursoId, true);
  if (problemas.length > 0) {
    throw new ErroDeNegocio(
      `Ainda não dá para desbloquear este curso: ${problemas
        .map((p) => p.texto)
        .join("; ")}.`,
    );
  }
};

// Envolve uma alteração (apagar lição, desativar questão, criar quiz...) numa
// transação e DESFAZ tudo se, com ela, um curso que já está desbloqueado
// ficasse incompleto. Só conta problemas NOVOS — um curso que já tinha
// pendências antes continua podendo ser editado.
export const comGuardaDePublicacao = async <T>(
  cursoId: string,
  operacao: (tx: Cliente) => Promise<T>,
): Promise<T> =>
  db.$transaction(
    async (tx) => {
      const curso = await tx.curso.findUnique({
        where: { id: cursoId },
        select: { desbloqueado: true },
      });
      const publicado = !!curso?.desbloqueado;

      const antes = publicado
        ? await levantarProblemas(tx, cursoId, false)
        : [];
      const resultado = await operacao(tx);

      if (publicado) {
        const chavesAntes = new Set(antes.map((p) => p.chave));
        const novos = (await levantarProblemas(tx, cursoId, false)).filter(
          (p) => !chavesAntes.has(p.chave),
        );
        if (novos.length > 0) {
          throw new ErroDeNegocio(
            `Esta alteração deixaria o curso desbloqueado incompleto (${novos
              .map((p) => p.texto)
              .join("; ")}). Bloqueie o curso antes de continuar.`,
          );
        }
      }
      return resultado;
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
