import { Inject, Injectable } from '@nestjs/common';
import { Direction, PrismaClient } from '../../../shared/driven/prisma/generated/client.js';
import { Transfer } from '../../domain/models/entities/transfer.entity.js';
import { Wallet } from '../../domain/models/entities/wallet.entity.js';
import type { WalletRepositoryPort } from '../../domain/ports/wallet.repository.port.js';

@Injectable()
export class WalletRepositoryAdapter implements WalletRepositoryPort {
	readonly #prisma: PrismaClient;

	constructor(@Inject(PrismaClient) prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async findById(walletId: string): Promise<Wallet | null> {
		const [row, totals] = await Promise.all([
			this.#prisma.wallet.findUnique({ where: { id: walletId } }),
			this.#prisma.transfer.groupBy({
				by: ['direction'],
				where: { walletId },
				_sum: { amount: true },
			}),
		]);
		const total = (direction: Direction) => totals.find((sum) => sum.direction === direction)?._sum.amount ?? 0n;

		return row ? new Wallet(row.id, row.holderId, row.currency, total('CREDIT') - total('DEBIT')) : null;
	}

	async findTransfers(walletId: string): Promise<Transfer[]> {
		const rows = await this.#prisma.transfer.findMany({
			where: { walletId },
			orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		});

		return rows.map((row) =>
			Transfer.create({
				walletId: row.walletId,
				idempotencyKeyId: row.idempotencyKeyId,
				direction: row.direction as Direction,
				amount: BigInt(row.amount),
			}),
		);
	}
}
