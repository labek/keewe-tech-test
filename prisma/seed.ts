import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/shared/driven/prisma/generated/client.js';

const MARTIN = '01970000-0000-7000-8000-000000000001';
const DURAND = '01970000-0000-7000-8000-000000000002';
const NOVA = '01970000-0000-7000-8000-000000000003';

const wallets = [
	{ id: '01970000-0000-7000-8000-0000000000a1', holderId: MARTIN, currency: 'EUR' },
	{ id: '01970000-0000-7000-8000-0000000000a2', holderId: MARTIN, currency: 'USD' },
	{ id: '01970000-0000-7000-8000-0000000000b1', holderId: DURAND, currency: 'EUR' },
	{ id: '01970000-0000-7000-8000-0000000000c1', holderId: NOVA, currency: 'EUR' },
	{ id: '01970000-0000-7000-8000-0000000000c2', holderId: NOVA, currency: 'USD' },
];

const entries = [
	{
		id: '01970000-0000-7000-8000-0000000001a1',
		walletId: '01970000-0000-7000-8000-0000000000a1',
		direction: 'CREDIT' as const,
		amount: 1_500_000n,
	},
	{
		id: '01970000-0000-7000-8000-0000000001a2',
		walletId: '01970000-0000-7000-8000-0000000000a2',
		direction: 'CREDIT' as const,
		amount: 200_000n,
	},
	{
		id: '01970000-0000-7000-8000-0000000001b1',
		walletId: '01970000-0000-7000-8000-0000000000b1',
		direction: 'CREDIT' as const,
		amount: 250_000n,
	},
	{
		id: '01970000-0000-7000-8000-0000000001c2',
		walletId: '01970000-0000-7000-8000-0000000000c2',
		direction: 'CREDIT' as const,
		amount: 500_000n,
	},
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
	for (const wallet of wallets) {
		await prisma.wallet.upsert({ where: { id: wallet.id }, create: wallet, update: {} });
	}
	for (const entry of entries) {
		await prisma.entry.upsert({ where: { id: entry.id }, create: entry, update: {} });
	}
	console.log(`Seed: ${wallets.length} wallets in EUR and USD, ${entries.length} entries.`);
} finally {
	await prisma.$disconnect();
}
