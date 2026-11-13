import { IdempotencyKey } from '../models/entities/idempotency-key.entity.js';
import { Transfer } from '../models/entities/transfer.entity.js';

export interface CreateTransferInput {
	idempotencyKey: IdempotencyKey;
	transfers: {
		debit: Transfer;
		credit: Transfer;
	};
}

export abstract class TransferRepositoryPort {
	abstract createTransfers(input: CreateTransferInput): Promise<Transfer[]>;
}
