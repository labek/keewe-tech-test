import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '../../shared/driven/prisma/generated/client.js';

export interface WalletFixture {
	id?: string;
	holderId?: string;
	currency?: string;
	balance?: bigint;
}

export async function givenWallet(prisma: PrismaClient, wallet: WalletFixture = {}) {
	const balance = wallet.balance ?? 0n;

	return prisma.wallet.create({
		data: {
			id: wallet.id ?? randomUUID(),
			holderId: wallet.holderId ?? randomUUID(),
			currency: wallet.currency ?? 'EUR',
			balance,
			entries: balance === 0n ? undefined : { create: { id: randomUUID(), direction: 'CREDIT', amount: balance } },
		},
	});
}
