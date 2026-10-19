/*
  Warnings:

  - A unique constraint covering the columns `[titulo]` on the table `Conquista` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titulo]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cursoId,titulo]` on the table `Licao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cursoId,titulo]` on the table `Modulo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CalculoDeProgresso" ADD COLUMN     "concluidoEm" TIMESTAMP(3),
ADD COLUMN     "cursoConcluido" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Conquista_titulo_key" ON "Conquista"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_titulo_key" ON "Curso"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Licao_cursoId_titulo_key" ON "Licao"("cursoId", "titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_cursoId_titulo_key" ON "Modulo"("cursoId", "titulo");
