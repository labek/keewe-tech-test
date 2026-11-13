-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ledger";

-- CreateTable
CREATE TABLE "ledger"."idempotency_key" (
    "id" UUID NOT NULL,
    "fingerprint" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_key_fingerprint_unique" ON "ledger"."idempotency_key"("fingerprint");

-- AddForeignKey
ALTER TABLE "ledger"."transfer" ADD CONSTRAINT "transfer_idempotency_key_id_fkey" FOREIGN KEY ("idempotency_key_id") REFERENCES "ledger"."idempotency_key"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
