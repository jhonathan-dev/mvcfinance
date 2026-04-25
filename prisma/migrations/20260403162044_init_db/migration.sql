-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('DEPOSIT', 'EXPENSE', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "OperationCategory" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD', 'ENTERTAINMENT', 'HEALTH', 'UTILITY', 'SALARY', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "OperationPaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'OTHER');

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "OperationCategory" NOT NULL,
    "paymentMethod" "OperationPaymentMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);
