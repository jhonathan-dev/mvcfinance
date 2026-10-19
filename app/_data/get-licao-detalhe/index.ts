import { db } from "@/app/_lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getAcessoCursos } from "@/app/_data/get-acesso-cursos";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";

// Lição + contexto necessário pela tela: anotação já salva pelo usuário,
// se ela já foi concluída, e qual é a lição anterior/próxima (para os
// botões de navegação), considerando a ordem módulo -> lição do curso.
export const getLicaoDetalhe = async (cursoId: string, licaoId: string) => {
  const usuario = await getOrCreateUsuarioAtual();

  const [curso, licao] = await Promise.all([
    db.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: { licoes: { orderBy: { ordem: "asc" } } },
        },
        questionario: true,
      },
    }),
    db.licao.findUnique({ where: { id: licaoId } }),
  ]);

  if (!curso || !licao || licao.cursoId !== cursoId) {
    notFound();
  }

  // Curso bloqueado (premium, sequência ou trava do admin): volta pra lista.
  const { acessos } = await getAcessoCursos();
  if (!acessos[cursoId]?.liberado) {
    redirect("/cursos");
  }

  const licoesOrdenadas = curso.modulos.flatMap((m) => m.licoes);
  const indiceAtual = licoesOrdenadas.findIndex((l) => l.id === licaoId);
  const licaoAnterior =
    indiceAtual > 0 ? licoesOrdenadas[indiceAtual - 1] : null;
  const proximaLicao =
    indiceAtual >= 0 && indiceAtual < licoesOrdenadas.length - 1
      ? licoesOrdenadas[indiceAtual + 1]
      : null;
  const ultimaLicaoDoCurso = indiceAtual === licoesOrdenadas.length - 1;

  const [progresso, anotacao] = await Promise.all([
    db.progressoUsuarioLicao.findUnique({
      where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
    }),
    db.anotacaoLicao.findUnique({
      where: { usuarioId_licaoId: { usuarioId: usuario.id, licaoId } },
    }),
  ]);

  return {
    usuario,
    curso,
    licao,
    concluida: progresso?.licaoRealizada ?? false,
    anotacaoTexto: anotacao?.blocoDeNotas ?? "",
    licaoAnterior,
    proximaLicao,
    ultimaLicaoDoCurso,
    temQuestionario: !!curso.questionario,
  };
};

export type LicaoDetalhe = Awaited<ReturnType<typeof getLicaoDetalhe>>;
