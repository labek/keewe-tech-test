-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ledger";

-- CreateTable
CREATE TABLE "ledger"."idempotency_key" (
    "key" UUID NOT NULL,
    "fingerprint" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_key_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_key_fingerprint_unique" ON "ledger"."idempotency_key"("fingerprint");
