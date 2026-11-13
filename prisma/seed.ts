import { createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { Direction, PrismaClient } from '../src/shared/driven/prisma/generated/client.js';

const MARTIN = '01970000-0000-7000-8000-000000000001';
const DURAND = '01970000-0000-7000-8000-000000000002';
const NOVA = '01970000-0000-7000-8000-000000000003';

const Currency = {
	EUR: 'EUR',
	USD: 'USD',
} as const;

const wallets = [
	{
		id: '01970000-0000-7000-8000-0000000000a1',
		holderId: MARTIN,
		currency: Currency.EUR,
		balance: 0n,
	},
	{
		id: '01970000-0000-7000-8000-0000000000a2',
		holderId: MARTIN,
		currency: Currency.USD,
		balance: 0n,
	},
	{
		id: '01970000-0000-7000-8000-0000000000b1',
		holderId: DURAND,
		currency: Currency.EUR,
		balance: 0n,
	},
	{
		id: '01970000-0000-7000-8000-0000000000c1',
		holderId: NOVA,
		currency: Currency.EUR,
		balance: 0n,
	},
	{
		id: '01970000-0000-7000-8000-0000000000c2',
		holderId: NOVA,
		currency: Currency.USD,
		balance: 0n,
	},
];

const transfers = [
	{
		id: '01970000-0000-7000-8000-0000000001a1',
		walletId: '01970000-0000-7000-8000-0000000000a1',
		direction: Direction.CREDIT,
		amount: 1_500_000n,
		idempotencyKeyId: '01970000-0000-7000-8000-0000000001d1',
	},
	{
		id: '01970000-0000-7000-8000-0000000001a2',
		walletId: '01970000-0000-7000-8000-0000000000a2',
		direction: Direction.CREDIT,
		amount: 200_000n,
		idempotencyKeyId: '01970000-0000-7000-8000-0000000001d2',
	},
	{
		id: '01970000-0000-7000-8000-0000000001b1',
		walletId: '01970000-0000-7000-8000-0000000000b1',
		direction: Direction.CREDIT,
		amount: 250_000n,
		idempotencyKeyId: '01970000-0000-7000-8000-0000000001d3',
	},
	{
		id: '01970000-0000-7000-8000-0000000001c2',
		walletId: '01970000-0000-7000-8000-0000000000c2',
		direction: Direction.CREDIT,
		amount: 500_000n,
		idempotencyKeyId: '01970000-0000-7000-8000-0000000001d4',
	},
];

const idempotencyKeys = [
	{
		id: '01970000-0000-7000-8000-0000000001d1',
		fingerprint: createHash('sha256')
			.update(
				JSON.stringify(transfers[0], (_, value) =>
					typeof value === 'bigint' ? JSON.stringify({ ...transfers[0], amount: Number(transfers[0]?.amount) }) : value,
				),
			)
			.digest('hex'),
	},
	{
		id: '01970000-0000-7000-8000-0000000001d2',
		fingerprint: createHash('sha256')
			.update(
				JSON.stringify(transfers[1], (_, value) =>
					typeof value === 'bigint' ? JSON.stringify({ ...transfers[1], amount: Number(transfers[1]?.amount) }) : value,
				),
			)
			.digest('hex'),
	},
	{
		id: '01970000-0000-7000-8000-0000000001d3',
		fingerprint: createHash('sha256')
			.update(
				JSON.stringify(transfers[2], (_, value) =>
					typeof value === 'bigint' ? JSON.stringify({ ...transfers[2], amount: Number(transfers[2]?.amount) }) : value,
				),
			)
			.digest('hex'),
	},
	{
		id: '01970000-0000-7000-8000-0000000001d4',
		fingerprint: createHash('sha256')
			.update(
				JSON.stringify(transfers[3], (_, value) =>
					typeof value === 'bigint' ? JSON.stringify({ ...transfers[3], amount: Number(transfers[3]?.amount) }) : value,
				),
			)
			.digest('hex'),
	},
];

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
	for (const wallet of wallets) {
		await prisma.wallet.upsert({
			where: { id: wallet.id },
			create: wallet,
			update: {},
		});
	}

	for (const idempotencyKey of idempotencyKeys) {
		await prisma.idempotencyKey.upsert({
			where: { id: idempotencyKey.id },
			create: idempotencyKey,
			update: {},
		});
	}

	for (const transfer of transfers) {
		const { walletId, direction, amount } = transfer;

		await prisma.transfer.upsert({
			where: { id: transfer.id },
			create: transfer,
			update: {},
		});

		// Compute balance of each wallet after entry insertion
		const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });

		if (wallet) {
			const updatedBalance = direction === Direction.CREDIT ? wallet.balance + amount : wallet.balance - amount;

			await prisma.wallet.update({
				where: { id: walletId },
				data: { balance: updatedBalance },
			});
		}
	}

	console.log(`Seed: ${wallets.length} wallets in EUR and USD, ${transfers.length} transfers.`);
} finally {
	await prisma.$disconnect();
}
