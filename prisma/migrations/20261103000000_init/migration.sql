-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ledger";

-- CreateEnum
CREATE TYPE "ledger"."EntryDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "ledger"."wallet" (
    "id" UUID NOT NULL,
    "holder_id" UUID NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger"."entry" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "direction" "ledger"."EntryDirection" NOT NULL,
    "amount" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_holder_id_currency_key" ON "ledger"."wallet"("holder_id", "currency");

-- AddForeignKey
ALTER TABLE "ledger"."entry" ADD CONSTRAINT "entry_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "ledger"."wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

