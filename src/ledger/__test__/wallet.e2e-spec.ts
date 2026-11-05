import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaClient } from '../../shared/driven/prisma/generated/client.js';
import { givenWallet } from './wallet.fixtures.js';

describe('Wallets', () => {
	let app: INestApplication;
	let prisma: PrismaClient;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
		app = moduleRef.createNestApplication();
		await app.init();
		prisma = app.get(PrismaClient);
	});

	afterEach(async () => {
		await app.close();
	});

	it('returns a wallet with its balance', async () => {
		const wallet = await givenWallet(prisma, { currency: 'USD', balance: 1050n });

		const response = await request(app.getHttpServer()).get(`/wallets/${wallet.id}`).expect(200);

		expect(response.body).toEqual({
			id: wallet.id,
			holderId: wallet.holderId,
			currency: 'USD',
			balance: '1050',
		});
	});

	it('computes the balance as credits minus debits', async () => {
		const wallet = await givenWallet(prisma, { balance: 1000n });
		await prisma.entry.create({ data: { id: randomUUID(), walletId: wallet.id, direction: 'DEBIT', amount: 250n } });

		const response = await request(app.getHttpServer()).get(`/wallets/${wallet.id}`).expect(200);

		expect(response.body.balance).toBe('750');
	});

	it('lists the entries that explain the balance', async () => {
		const wallet = await givenWallet(prisma, { balance: 1050n });

		const response = await request(app.getHttpServer()).get(`/wallets/${wallet.id}/entries`).expect(200);

		expect(response.body).toEqual([
			{ id: expect.any(String), direction: 'CREDIT', amount: '1050', createdAt: expect.any(String) },
		]);
	});

	it('answers 404 for an unknown wallet', async () => {
		await request(app.getHttpServer()).get('/wallets/01970000-0000-7000-8000-0000000000ff').expect(404);
		await request(app.getHttpServer()).get('/wallets/01970000-0000-7000-8000-0000000000ff/entries').expect(404);
	});

	it('answers 400 when the wallet id is not a UUID', async () => {
		await request(app.getHttpServer()).get('/wallets/not-a-uuid').expect(400);
	});
});
