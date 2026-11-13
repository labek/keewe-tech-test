-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ledger";

-- CreateEnum
CREATE TYPE "ledger"."Direction" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "ledger"."wallet" (
    "id" UUID NOT NULL,
    "holder_id" UUID NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger"."transfer" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "direction" "ledger"."Direction" NOT NULL,
    "amount" BIGINT NOT NULL,
    "idempotency_key_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_holder_id_currency_key" ON "ledger"."wallet"("holder_id", "currency");

-- AddForeignKey
ALTER TABLE "ledger"."transfer" ADD CONSTRAINT "transfer_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "ledger"."wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

