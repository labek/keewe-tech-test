import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module.js';
import { PrismaClient } from '../driven/prisma/generated/client.js';

describe('Startup', () => {
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

	it('starts with an empty database', async () => {
		const wallets = await prisma.wallet.count();

		expect(wallets).toBe(0);
	});
});
