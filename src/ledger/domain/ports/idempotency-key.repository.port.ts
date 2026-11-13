import { IdempotencyKey } from '../models/entities/idempotency-key.entity.js';

export abstract class IdempotencyKeyRepositoryPort {
	abstract findById(id: string): Promise<IdempotencyKey | null>;
	abstract insert(idempotencyKey: IdempotencyKey): Promise<IdempotencyKey>;
}
