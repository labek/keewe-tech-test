import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '../../shared/driven/prisma/generated/client.js';
import { Entry, type EntryDirection } from '../domain/entry.js';
import { Wallet } from '../domain/wallet.js';
import type { WalletRepository } from '../domain/wallet.repository.js';

@Injectable()
export class PrismaWalletRepository implements WalletRepository {
	readonly #prisma: PrismaClient;

	constructor(@Inject(PrismaClient) prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async findById(walletId: string): Promise<Wallet | null> {
		const [row, totals] = await Promise.all([
			this.#prisma.wallet.findUnique({ where: { id: walletId } }),
			this.#prisma.entry.groupBy({ by: ['direction'], where: { walletId }, _sum: { amount: true } }),
		]);
		const total = (direction: EntryDirection) => totals.find((sum) => sum.direction === direction)?._sum.amount ?? 0n;

		return row ? new Wallet(row.id, row.holderId, row.currency, total('CREDIT') - total('DEBIT')) : null;
	}

	async findEntries(walletId: string): Promise<Entry[]> {
		const rows = await this.#prisma.entry.findMany({
			where: { walletId },
			orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		});

		return rows.map((row) => new Entry(row.id, row.walletId, row.direction, row.amount, row.createdAt));
	}
}
