/*
  Warnings:

  - The values [UTILITY,OTHER] on the enum `TransactionCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTHER] on the enum `TransactionPaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `TypeUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionCategory_new" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'CLOTHING', 'BEAUTY', 'PETS', 'TRAVEL', 'SUBSCRIPTIONS', 'PHONE_INTERNET', 'ENERGY_WATER', 'TAXES', 'INSURANCE', 'SALARY', 'FREELANCE', 'RENTAL_INCOME', 'DIVIDENDS', 'REFUND', 'GIFT_RECEIVED', 'ASSET_SALE', 'FIXED_INCOME', 'VARIABLE_INCOME', 'REAL_ESTATE_FUNDS', 'CRYPTO', 'PRIVATE_PENSION', 'SAVINGS');
ALTER TABLE "Transaction" ALTER COLUMN "category" TYPE "TransactionCategory_new" USING ("category"::text::"TransactionCategory_new");
ALTER TYPE "TransactionCategory" RENAME TO "TransactionCategory_old";
ALTER TYPE "TransactionCategory_new" RENAME TO "TransactionCategory";
DROP TYPE "TransactionCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionPaymentMethod_new" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX');
ALTER TABLE "Transaction" ALTER COLUMN "paymentMethod" TYPE "TransactionPaymentMethod_new" USING ("paymentMethod"::text::"TransactionPaymentMethod_new");
ALTER TYPE "TransactionPaymentMethod" RENAME TO "TransactionPaymentMethod_old";
ALTER TYPE "TransactionPaymentMethod_new" RENAME TO "TransactionPaymentMethod";
DROP TYPE "TransactionPaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_typeId_fkey";

-- DropTable
DROP TABLE "TypeUser";

-- DropTable
DROP TABLE "User";
