/*
  Warnings:

  - You are about to drop the column `xp` on the `Curso` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `Licao` table. All the data in the column will be lost.
  - You are about to drop the column `qtdLicoes` on the `Modulo` table. All the data in the column will be lost.
  - You are about to drop the column `beneficios` on the `Plano` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `Questionario` table. All the data in the column will be lost.
  - You are about to drop the column `moduloAtualId` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_moduloAtualId_fkey";

-- AlterTable
ALTER TABLE "Auditoria" ADD COLUMN     "hora" TIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "data" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "xp";

-- AlterTable
ALTER TABLE "Licao" DROP COLUMN "xp";

-- AlterTable
ALTER TABLE "Modulo" DROP COLUMN "qtdLicoes";

-- AlterTable
ALTER TABLE "Plano" DROP COLUMN "beneficios";

-- AlterTable
ALTER TABLE "Questionario" DROP COLUMN "xp";

-- AlterTable
ALTER TABLE "TipoOperacao" ADD COLUMN     "icone" TEXT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "moduloAtualId";

-- CreateTable
CREATE TABLE "ConstantesXP" (
    "id" TEXT NOT NULL,
    "qtdXpCurso" INTEGER NOT NULL DEFAULT 0,
    "qtdXpLicao" INTEGER NOT NULL DEFAULT 0,
    "qtdXpQuestionario" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConstantesXP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficioPlano" (
    "id" TEXT NOT NULL,
    "beneficio" TEXT NOT NULL,
    "limiteOperacoes" INTEGER,
    "planoId" TEXT NOT NULL,

    CONSTRAINT "BeneficioPlano_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeneficioPlano" ADD CONSTRAINT "BeneficioPlano_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;
