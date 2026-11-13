import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IdempotencyKey } from '../../domain/models/entities/idempotency-key.entity.js';
import { IdempotencyKeyRepositoryPort } from '../../domain/ports/idempotency-key.repository.port.js';
import { CreateIdempotencyKeyInputDto } from '../../driving/dto/input/create-idempotency-key.input-dto.js';

@Injectable()
export class IdempotencyKeyUseCase {
	readonly #idempotencyKeyRepository: IdempotencyKeyRepositoryPort;

	constructor(@Inject(IdempotencyKeyRepositoryPort) idempotencyKeyRepository: IdempotencyKeyRepositoryPort) {
		this.#idempotencyKeyRepository = idempotencyKeyRepository;
	}

	generateFingerprint(payload: unknown): string {
		const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

		return fingerprint;
	}

	async findById(id: string): Promise<IdempotencyKey | null> {
		return await this.#idempotencyKeyRepository.findById(id);
	}

	async createIdempotencyKey(payload: CreateIdempotencyKeyInputDto): Promise<IdempotencyKey> {
		const idempotencyKey = IdempotencyKey.create({ id: payload.id, payload: JSON.stringify(payload) });

		return await this.#idempotencyKeyRepository.insert(idempotencyKey);
	}
}
