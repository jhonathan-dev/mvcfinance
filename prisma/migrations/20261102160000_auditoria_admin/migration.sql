-- Auditoria das ações do painel admin: amplia a tabela "Auditoria" que já
-- existia (data, hora, descricao, usuarioId) com quem/o quê/resultado.
-- O vínculo com Usuario passa a ser opcional e a virar NULL (e não mais
-- CASCADE): excluir a conta de um admin NÃO apaga o histórico do que ele fez.

-- DropForeignKey
ALTER TABLE "Auditoria" DROP CONSTRAINT "Auditoria_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Auditoria" ADD COLUMN     "acao" TEXT NOT NULL DEFAULT 'legado',
ADD COLUMN     "adminClerkId" TEXT,
ADD COLUMN     "adminEmail" TEXT,
ADD COLUMN     "adminNome" TEXT,
ADD COLUMN     "alvoId" TEXT,
ADD COLUMN     "alvoRotulo" TEXT,
ADD COLUMN     "alvoTipo" TEXT,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detalhes" JSONB,
ADD COLUMN     "erro" TEXT,
ADD COLUMN     "sucesso" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "usuarioId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Auditoria_criadoEm_idx" ON "Auditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "Auditoria_acao_idx" ON "Auditoria"("acao");

-- CreateIndex
CREATE INDEX "Auditoria_adminClerkId_idx" ON "Auditoria"("adminClerkId");

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
