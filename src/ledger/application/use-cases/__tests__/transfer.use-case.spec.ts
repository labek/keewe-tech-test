import { Mocked } from 'vitest';
import { Direction } from '../../../../shared/driven/prisma/generated/enums.js';
import { IdempotencyKeyExistingIdException } from '../../../domain/errors/idempotency-key-existing-id-exception.error.js';
import { TransferInvalidAmountException } from '../../../domain/errors/transfer-invalid-amount-exception.error.js';
import { WalletNotFoundException } from '../../../domain/errors/wallet-not-found-exception.error.js';
import { IdempotencyKey } from '../../../domain/models/entities/idempotency-key.entity.js';
import { Transfer } from '../../../domain/models/entities/transfer.entity.js';
import { Wallet } from '../../../domain/models/entities/wallet.entity.js';
import { IdempotencyKeyRepositoryPort } from '../../../domain/ports/idempotency-key.repository.port.js';
import { TransferRepositoryPort } from '../../../domain/ports/transfer.repository.port.js';
import { WalletRepositoryPort } from '../../../domain/ports/wallet.repository.port.js';
import { IdempotencyKeyRepositoryAdapter } from '../../../driven/adapters/idempotency-key.repository.adapter.js';
import { TransferRepositoryAdapter } from '../../../driven/adapters/transfer.repository.js';
import { WalletRepositoryAdapter } from '../../../driven/adapters/wallet.repository.adapter.js';
import { CreateTransferInputDto } from '../../../driving/dto/input/create-transfer.input-dto.js';
import { TransferUseCase } from '../transfer.use-case.js';

describe('TransferUseCase', () => {
	// Data
	const debtorWalletId = '01a1d575-2f74-761f-9822-c345239b27fa';
	const creditorWalletId = '01a1d575-5b75-7055-999f-9f53776e0dcb';
	const debtorHolderId = '01a1d576-1b5d-761b-acda-07f22aed6096';
	const creditorHolderId = '01a1d576-31ef-737e-bc6e-5ec34e39c5bc';
	const idempotencyKeyId = '01a1d599-afd6-7299-b988-2bae3fdbc6f0';

	const payload: CreateTransferInputDto = {
		debtorWalletId,
		creditorWalletId,
		amount: '1050',
	};

	// Idempotency key
	const idempotencyKey = IdempotencyKey.create({
		id: idempotencyKeyId,
		payload: JSON.stringify(payload),
	});

	// Wallets
	const debtorWallet = new Wallet(debtorWalletId, debtorHolderId, 'EUR', 1050n);
	const creditorWallet = new Wallet(creditorWalletId, creditorHolderId, 'EUR', 1050n);

	// Transfers
	const debitTransfer = Transfer.create({
		amount: 1050n,
		walletId: debtorWalletId,
		direction: Direction.DEBIT,
		idempotencyKeyId,
	});

	const creditTransfer = Transfer.create({
		amount: 1050n,
		walletId: creditorWalletId,
		direction: Direction.CREDIT,
		idempotencyKeyId,
	});

	// Mocks
	let idempotencyKeyRepositoryMock: Mocked<IdempotencyKeyRepositoryAdapter>;
	let transferRepositoryMock: Mocked<TransferRepositoryAdapter>;
	let walletRepositoryMock: Mocked<WalletRepositoryAdapter>;

	// Use case
	let useCase: TransferUseCase;

	beforeAll(() => {
		// Mocks
		idempotencyKeyRepositoryMock = vi.mocked(IdempotencyKeyRepositoryAdapter.prototype);
		transferRepositoryMock = vi.mocked(TransferRepositoryAdapter.prototype);
		walletRepositoryMock = vi.mocked(WalletRepositoryAdapter.prototype);

		// Use case
		useCase = new TransferUseCase(idempotencyKeyRepositoryMock, transferRepositoryMock, walletRepositoryMock);
	});

	beforeEach(() => {
		// Mocks
		idempotencyKeyRepositoryMock.findById = vi.fn<IdempotencyKeyRepositoryPort['findById']>().mockResolvedValue(null);

		walletRepositoryMock.findById = vi
			.fn<WalletRepositoryPort['findById']>()
			.mockResolvedValueOnce(debtorWallet)
			.mockResolvedValue(creditorWallet);

		transferRepositoryMock.createTransfers = vi
			.fn<TransferRepositoryPort['createTransfers']>()
			.mockResolvedValue([debitTransfer, creditTransfer]);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	describe('execute', () => {
		it('should throw an error when the idempotency key ID already exists', async () => {
			// Arrange
			idempotencyKeyRepositoryMock.findById = vi
				.fn<IdempotencyKeyRepositoryPort['findById']>()
				.mockResolvedValueOnce(idempotencyKey);

			// Act
			const received = () => useCase.execute(idempotencyKeyId, payload);

			// Assert
			await expect(received).rejects.toThrow(IdempotencyKeyExistingIdException);
		});

		it.each([
			{
				testTitleCondition: 'is not a stringified number',
				amount: 'not-a-number',
			},
			{
				testTitleCondition: 'is less than the minimum safe integer',
				amount: Number.MIN_SAFE_INTEGER.toString(),
			},
			{
				testTitleCondition: 'is greater than the maximum safe integer',
				amount: Number.MAX_SAFE_INTEGER.toString(),
			},
			{
				testTitleCondition: 'equals to 0',
				amount: '0',
			},
		])('should throw an error when the payload amount is $testTitleCondition', async ({ amount }) => {
			// Arrange
			const updatedPayload: CreateTransferInputDto = { ...payload, amount };

			// Act
			const received = () => useCase.execute(idempotencyKeyId, updatedPayload);

			// Assert
			await expect(received).rejects.toThrow(TransferInvalidAmountException);
		});

		it('should throw an error when the debtor wallet does not exist', async () => {
			// Arrange
			walletRepositoryMock.findById = vi.fn<WalletRepositoryPort['findById']>().mockResolvedValueOnce(null);

			// Act
			const received = () => useCase.execute(idempotencyKeyId, payload);

			// Assert
			await expect(received).rejects.toThrow(WalletNotFoundException);
		});

		it('should throw an error when the creditor wallet does not exist', async () => {
			// Arrange
			walletRepositoryMock.findById = vi
				.fn<WalletRepositoryPort['findById']>()
				.mockResolvedValueOnce(debtorWallet)
				.mockResolvedValueOnce(null);

			// Act
			const received = () => useCase.execute(idempotencyKeyId, payload);

			// Assert
			await expect(received).rejects.toThrow(WalletNotFoundException);
		});

		it('should create both debit and credit transfers when transfers are created', async () => {
			// Act
			const received = await useCase.execute(idempotencyKeyId, payload);
			const expected = [
				Transfer.rehydrate({
					...debitTransfer.snapshot(),
					id: expect.any(String),
					createdAt: expect.any(Date),
				}),
				Transfer.rehydrate({
					...creditTransfer.snapshot(),
					id: expect.any(String),
					createdAt: expect.any(Date),
				}),
			];

			// Assert
			expect(received).toStrictEqual(expected);
		});
	});
});
