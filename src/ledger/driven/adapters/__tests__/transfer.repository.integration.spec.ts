import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../../../app.module.js';
import { Direction, PrismaClient } from '../../../../shared/driven/prisma/generated/client.js';
import { WalletInsufficientFundException } from '../../../domain/errors/wallet-insufficient-fund-exception.error.js';
import { WalletNotFoundException } from '../../../domain/errors/wallet-not-found-exception.error.js';
import { IdempotencyKey } from '../../../domain/models/entities/idempotency-key.entity.js';
import { Transfer } from '../../../domain/models/entities/transfer.entity.js';
import { CreateTransferInput, TransferRepositoryPort } from '../../../domain/ports/transfer.repository.port.js';
import { CreateTransferInputDto } from '../../../driving/dto/input/create-transfer.input-dto.js';
import { TransferRepositoryAdapter } from '../transfer.repository.js';

describe('TransferRepository (integration)', () => {
	// Data
	const NONEXISTENT_WALLET_ID = '01a1d562-64b8-71cf-bb02-81451ba3581f';
	const debtorWalletId = '01a1d575-2f74-761f-9822-c345239b27fa';
	const creditorWalletId = '01a1d575-5b75-7055-999f-9f53776e0dcb';
	const debtorHolderId = '01a1d576-1b5d-761b-acda-07f22aed6096';
	const creditorHolderId = '01a1d576-31ef-737e-bc6e-5ec34e39c5bc';

	// Dependencies
	let app: INestApplication;
	let prisma: PrismaClient;
	let repository: TransferRepositoryPort;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
		app = moduleRef.createNestApplication();
		await app.init();

		prisma = app.get(PrismaClient);
		repository = new TransferRepositoryAdapter(prisma);
	});

	beforeEach(async () => {
		// Debtor wallet
		await prisma.wallet.create({
			data: {
				id: debtorWalletId,
				balance: 1050n,
				holderId: debtorHolderId,
				currency: 'EUR',
			},
		});

		// Creditor wallet
		await prisma.wallet.create({
			data: {
				id: creditorWalletId,
				balance: 1050n,
				holderId: creditorHolderId,
				currency: 'EUR',
			},
		});
	});

	afterEach(async () => {
		await prisma.transfer.deleteMany();
		await prisma.idempotencyKey.deleteMany();
		await prisma.wallet.deleteMany();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('createTransfers', () => {
		// Data
		const payload: CreateTransferInputDto = {
			debtorWalletId,
			creditorWalletId,
			amount: '1050',
		};

		const idempotencyKeyId = '019f4444-ffff-7000-8000-ffffffffffff';

		const idempotencyKey = IdempotencyKey.create({
			id: idempotencyKeyId,
			payload: JSON.stringify(payload),
		});

		const input: CreateTransferInput = {
			idempotencyKey,
			transfers: {
				debit: Transfer.create({
					amount: BigInt(payload.amount),
					walletId: payload.debtorWalletId,
					direction: Direction.DEBIT,
					idempotencyKeyId: idempotencyKey.snapshot().id,
				}),
				credit: Transfer.create({
					amount: BigInt(payload.amount),
					walletId: payload.creditorWalletId,
					direction: Direction.CREDIT,
					idempotencyKeyId: idempotencyKey.snapshot().id,
				}),
			},
		};

		it('should throw an error when the debtor wallet ID passed does not exist', async () => {
			// Arrange
			const invalidInput: CreateTransferInput = {
				...input,
				transfers: {
					...input.transfers,
					debit: Transfer.create({
						amount: BigInt(1050),
						walletId: NONEXISTENT_WALLET_ID,
						direction: Direction.DEBIT,
						idempotencyKeyId: idempotencyKey.snapshot().id,
					}),
				},
			};

			// Act
			const received = () => repository.createTransfers(invalidInput);

			// Assert
			await expect(received).rejects.toThrow(WalletNotFoundException);
		});

		it('should throw an error when the creditor wallet ID passed does not exist', async () => {
			// Arrange
			const invalidInput: CreateTransferInput = {
				...input,
				transfers: {
					...input.transfers,
					credit: Transfer.create({
						amount: BigInt(1050),
						walletId: NONEXISTENT_WALLET_ID,
						direction: Direction.CREDIT,
						idempotencyKeyId: idempotencyKey.snapshot().id,
					}),
				},
			};

			// Act
			const received = () => repository.createTransfers(invalidInput);

			// Assert
			await expect(received).rejects.toThrow(WalletNotFoundException);
		});

		it('should throw an error when the debtor wallet has insufficient funds to perform the debit transfer', async () => {
			// Arrange
			const invalidInput: CreateTransferInput = {
				...input,
				transfers: {
					...input.transfers,
					debit: Transfer.create({
						amount: BigInt(1051),
						walletId: debtorWalletId,
						direction: Direction.DEBIT,
						idempotencyKeyId: idempotencyKey.snapshot().id,
					}),
				},
			};

			// Act
			const received = () => repository.createTransfers(invalidInput);

			// Assert
			await expect(received).rejects.toThrow(WalletInsufficientFundException);
		});

		it('should create an idempotency key when transfers are created', async () => {
			// Arrange
			await repository.createTransfers(input);

			// Act
			const idempotencyKey = await prisma.idempotencyKey.findUnique({
				where: {
					id: input.idempotencyKey.snapshot().id,
				},
			});

			// Assert
			expect(idempotencyKey).toStrictEqual(input.idempotencyKey.snapshot());
		});

		it('should create both debit and credit transfers when transfers are created', async () => {
			// Arrange
			await repository.createTransfers(input);

			// Act
			const received = await prisma.transfer.findMany({
				where: {
					id: {
						in: [input.transfers.debit.snapshot().id, input.transfers.credit.snapshot().id],
					},
				},
			});

			const expected = [
				{
					id: input.transfers.debit.snapshot().id,
					amount: input.transfers.debit.snapshot().amount,
					direction: input.transfers.debit.snapshot().direction,
					walletId: input.transfers.debit.snapshot().walletId,
					idempotencyKeyId: input.transfers.debit.snapshot().idempotencyKeyId,
					createdAt: expect.any(Date),
				},
				{
					id: input.transfers.credit.snapshot().id,
					amount: input.transfers.credit.snapshot().amount,
					direction: input.transfers.credit.snapshot().direction,
					walletId: input.transfers.credit.snapshot().walletId,
					idempotencyKeyId: input.transfers.credit.snapshot().idempotencyKeyId,
					createdAt: expect.any(Date),
				},
			];

			// Assert
			expect(received).toStrictEqual(expected);
		});

		it('should update the debtor wallet balance when the debit transfer is created', async () => {
			// Arrange
			await repository.createTransfers(input);

			// Act
			const received = await prisma.wallet.findUnique({
				where: {
					id: debtorWalletId,
				},
			});

			const expected = {
				id: debtorWalletId,
				balance: 0n,
				holderId: debtorHolderId,
				currency: 'EUR',
				createdAt: expect.any(Date),
			};

			// Assert
			expect(received).toStrictEqual(expected);
		});

		it('should update the creditor wallet balance when the credit transfer is created', async () => {
			// Arrange
			await repository.createTransfers(input);

			// Act
			const received = await prisma.wallet.findUnique({
				where: {
					id: creditorWalletId,
				},
			});

			const expected = {
				id: creditorWalletId,
				balance: 2100n,
				holderId: creditorHolderId,
				currency: 'EUR',
				createdAt: expect.any(Date),
			};

			// Assert
			expect(received).toStrictEqual(expected);
		});
	});
});
