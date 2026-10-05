/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NivelEnsino" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "TransactionCategory";

-- DropEnum
DROP TYPE "TransactionPaymentMethod";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "nomeUsuario" TEXT,
    "imgUsuario" TEXT,
    "emailUsuario" TEXT,
    "senhaUsuario" TEXT,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "cursoAtualId" TEXT,
    "moduloAtualId" TEXT,
    "licaoAtualId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoOperacao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoOperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoOperacaoId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodoPagamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MetodoPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operacao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoOperacaoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "metodoPagamentoId" TEXT NOT NULL,

    CONSTRAINT "Operacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemaCurso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "TemaCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" TEXT,
    "duracao" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "nivelEnsino" "NivelEnsino" NOT NULL,
    "cor" TEXT NOT NULL,
    "desbloqueado" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "temaCursoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "qtdLicoes" INTEGER NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL,
    "desbloqueado" BOOLEAN NOT NULL DEFAULT false,
    "cursoId" TEXT NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imagem" TEXT,
    "resumo" TEXT NOT NULL,
    "duracao" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "desbloqueado" BOOLEAN NOT NULL DEFAULT false,
    "cursoId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,

    CONSTRAINT "Licao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionario" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" TEXT,
    "xp" INTEGER NOT NULL,
    "qtdQuestoes" INTEGER NOT NULL DEFAULT 5,
    "cursoId" TEXT NOT NULL,

    CONSTRAINT "Questionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL,
    "questionarioId" TEXT NOT NULL,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternativa" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "explicacao" TEXT,
    "questaoId" TEXT NOT NULL,

    CONSTRAINT "Alternativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conquista" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "preRequisito" TEXT,
    "imgConquistaBloq" TEXT,
    "imgConquistaDesb" TEXT,
    "qtdXpMinimo" INTEGER NOT NULL,

    CONSTRAINT "Conquista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnotacaoLicao" (
    "id" TEXT NOT NULL,
    "blocoDeNotas" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "licaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnotacaoLicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressoUsuarioLicao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "licaoId" TEXT NOT NULL,
    "licaoRealizada" BOOLEAN NOT NULL DEFAULT false,
    "dataRealizacaoLicao" TIMESTAMP(3),

    CONSTRAINT "ProgressoUsuarioLicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressoUsuarioQuestionario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "questionarioId" TEXT NOT NULL,
    "qtdAcertos" INTEGER NOT NULL DEFAULT 0,
    "questionarioFeito" BOOLEAN NOT NULL DEFAULT false,
    "dataRealizacaoQuestionario" TIMESTAMP(3),

    CONSTRAINT "ProgressoUsuarioQuestionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressoUsuarioConquista" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conquistaId" TEXT NOT NULL,
    "qtdConquistasDesbloqueadas" INTEGER NOT NULL DEFAULT 0,
    "desbloqueadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressoUsuarioConquista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculoDeProgresso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "licoesConcluidas" INTEGER NOT NULL DEFAULT 0,
    "percentualConcluido" INTEGER NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculoDeProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicoesPorCurso" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "qtdLicoes" INTEGER NOT NULL DEFAULT 0,
    "duracaoTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LicoesPorCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicoesPorModulo" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "qtdLicoes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LicoesPorModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorMensal" DECIMAL(10,2) NOT NULL,
    "stripePriceId" TEXT,
    "beneficios" JSONB,
    "ordem" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerkId_key" ON "Usuario"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_emailUsuario_key" ON "Usuario"("emailUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "TipoOperacao_tipo_key" ON "TipoOperacao"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Questionario_cursoId_key" ON "Questionario"("cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "AnotacaoLicao_usuarioId_licaoId_key" ON "AnotacaoLicao"("usuarioId", "licaoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoUsuarioLicao_usuarioId_licaoId_key" ON "ProgressoUsuarioLicao"("usuarioId", "licaoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoUsuarioQuestionario_usuarioId_questionarioId_key" ON "ProgressoUsuarioQuestionario"("usuarioId", "questionarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoUsuarioConquista_usuarioId_conquistaId_key" ON "ProgressoUsuarioConquista"("usuarioId", "conquistaId");

-- CreateIndex
CREATE UNIQUE INDEX "CalculoDeProgresso_usuarioId_cursoId_key" ON "CalculoDeProgresso"("usuarioId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "LicoesPorCurso_cursoId_key" ON "LicoesPorCurso"("cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "LicoesPorModulo_moduloId_key" ON "LicoesPorModulo"("moduloId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cursoAtualId_fkey" FOREIGN KEY ("cursoAtualId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_moduloAtualId_fkey" FOREIGN KEY ("moduloAtualId") REFERENCES "Modulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_licaoAtualId_fkey" FOREIGN KEY ("licaoAtualId") REFERENCES "Licao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_tipoOperacaoId_fkey" FOREIGN KEY ("tipoOperacaoId") REFERENCES "TipoOperacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacao" ADD CONSTRAINT "Operacao_tipoOperacaoId_fkey" FOREIGN KEY ("tipoOperacaoId") REFERENCES "TipoOperacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacao" ADD CONSTRAINT "Operacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacao" ADD CONSTRAINT "Operacao_metodoPagamentoId_fkey" FOREIGN KEY ("metodoPagamentoId") REFERENCES "MetodoPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_temaCursoId_fkey" FOREIGN KEY ("temaCursoId") REFERENCES "TemaCurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licao" ADD CONSTRAINT "Licao_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licao" ADD CONSTRAINT "Licao_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionario" ADD CONSTRAINT "Questionario_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questao" ADD CONSTRAINT "Questao_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternativa" ADD CONSTRAINT "Alternativa_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnotacaoLicao" ADD CONSTRAINT "AnotacaoLicao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnotacaoLicao" ADD CONSTRAINT "AnotacaoLicao_licaoId_fkey" FOREIGN KEY ("licaoId") REFERENCES "Licao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioLicao" ADD CONSTRAINT "ProgressoUsuarioLicao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioLicao" ADD CONSTRAINT "ProgressoUsuarioLicao_licaoId_fkey" FOREIGN KEY ("licaoId") REFERENCES "Licao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioQuestionario" ADD CONSTRAINT "ProgressoUsuarioQuestionario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioQuestionario" ADD CONSTRAINT "ProgressoUsuarioQuestionario_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioConquista" ADD CONSTRAINT "ProgressoUsuarioConquista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoUsuarioConquista" ADD CONSTRAINT "ProgressoUsuarioConquista_conquistaId_fkey" FOREIGN KEY ("conquistaId") REFERENCES "Conquista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculoDeProgresso" ADD CONSTRAINT "CalculoDeProgresso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculoDeProgresso" ADD CONSTRAINT "CalculoDeProgresso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicoesPorCurso" ADD CONSTRAINT "LicoesPorCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicoesPorModulo" ADD CONSTRAINT "LicoesPorModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
