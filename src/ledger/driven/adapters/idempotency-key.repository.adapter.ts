import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../shared/driven/prisma/generated/client.js';
import { IdempotencyKey } from '../../domain/models/entities/idempotency-key.entity.js';
import { IdempotencyKeyRepositoryPort } from '../../domain/ports/idempotency-key.repository.port.js';

@Injectable()
export class IdempotencyKeyRepositoryAdapter implements IdempotencyKeyRepositoryPort {
	readonly #prisma: PrismaClient;

	constructor(@Inject(PrismaClient) prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async findById(id: string): Promise<IdempotencyKey | null> {
		const row = await this.#prisma.idempotencyKey.findUnique({
			where: { id },
		});

		return row ? IdempotencyKey.rehydrate(row) : null;
	}

	async insert(idempotencyKey: IdempotencyKey): Promise<IdempotencyKey> {
		const row = await this.#prisma.idempotencyKey.create({
			data: idempotencyKey.snapshot(),
		});

		return IdempotencyKey.rehydrate(row);
	}
}
