/*
  Warnings:

  - You are about to drop the `Operation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "operation_type" AS ENUM ('DEPOSIT', 'EXPENSE', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "operation_category" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD', 'ENTERTAINMENT', 'HEALTH', 'UTILITY', 'SALARY', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "operation_payment_method" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'OTHER');

-- DropTable
DROP TABLE "Operation";

-- DropEnum
DROP TYPE "OperationCategory";

-- DropEnum
DROP TYPE "OperationPaymentMethod";

-- DropEnum
DROP TYPE "OperationType";

-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "operation_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "operation_category" NOT NULL,
    "paymentMethod" "operation_payment_method" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);
