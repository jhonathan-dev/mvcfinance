/*
  Warnings:

  - A unique constraint covering the columns `[tipoOperacaoId,nome]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `MetodoPagamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titulo]` on the table `TemaCurso` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categoria_tipoOperacaoId_nome_key" ON "Categoria"("tipoOperacaoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPagamento_nome_key" ON "MetodoPagamento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TemaCurso_titulo_key" ON "TemaCurso"("titulo");
