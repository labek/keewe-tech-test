import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../app.module.js';
import { PrismaClient } from '../../../../shared/driven/prisma/generated/client.js';
import { Wallet } from '../../../domain/models/entities/wallet.entity.js';
import { CreateTransferInputDto } from '../../dto/input/create-transfer.input-dto.js';

describe('TransferController', () => {
	// Data
	const debtorWalletId = '01a1d575-2f74-761f-9822-c345239b27fa';
	const creditorWalletId = '01a1d575-5b75-7055-999f-9f53776e0dcb';
	const debtorHolderId = '01a1d576-1b5d-761b-acda-07f22aed6096';
	const creditorHolderId = '01a1d576-31ef-737e-bc6e-5ec34e39c5bc';
	const idempotencyKeyId = '01a1d5ca-1c33-76cb-a291-71e4dbde4fa1';

	const payload: CreateTransferInputDto = {
		debtorWalletId,
		creditorWalletId,
		amount: '1050',
	};

	// Wallets
	const debtorWallet = new Wallet(debtorWalletId, debtorHolderId, 'EUR', 1050n);
	const creditorWallet = new Wallet(creditorWalletId, creditorHolderId, 'EUR', 1050n);

	// Setup
	let app: INestApplication;
	let prisma: PrismaClient;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleRef.createNestApplication();

		await app.init();

		prisma = app.get(PrismaClient);
	});

	beforeEach(async () => {
		await prisma.wallet.createMany({
			data: [
				{
					id: debtorWallet.id,
					holderId: debtorWallet.holderId,
					currency: debtorWallet.currency,
					balance: debtorWallet.balance,
				},
				{
					id: creditorWallet.id,
					holderId: creditorWallet.holderId,
					currency: creditorWallet.currency,
					balance: creditorWallet.balance,
				},
			],
		});
	});

	afterAll(async () => {
		await app.close();
	});

	it('should throw an error when the idempotency key ID is not present amont the headers', async () => {
		return request(app.getHttpServer()).post('/transfers').send(payload).expect(404).expect({
			detail: 'Idempotency-Key header is required.',
			status: 404,
			title: 'Webhook Event Not Found',
		});
	});

	it('should return both debit and credit transfers when transfers creation is successful', async () => {
		return request(app.getHttpServer())
			.post('/transfers')
			.set('Idempotency-Key', idempotencyKeyId)
			.send(payload)
			.expect(201);
	});
});
