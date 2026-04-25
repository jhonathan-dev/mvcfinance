/*
  Warnings:

  - You are about to drop the column `category` on the `operations` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `operations` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `operations` table. All the data in the column will be lost.
  - You are about to drop the `TypeUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `operations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethodId` to the `operations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `operations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_typeId_fkey";

-- AlterTable
ALTER TABLE "operations" DROP COLUMN "category",
DROP COLUMN "paymentMethod",
DROP COLUMN "type",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "paymentMethodId" TEXT NOT NULL,
ADD COLUMN     "typeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "TypeUser";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "operation_category";

-- DropEnum
DROP TYPE "operation_payment_method";

-- DropEnum
DROP TYPE "operation_type";

-- CreateTable
CREATE TABLE "operation_types" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "operation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_categories" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "operation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_payment_methods" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "operation_payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "operation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "operation_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "operation_payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
