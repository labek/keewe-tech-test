import { Inject, Injectable } from '@nestjs/common';
import { isNumber } from 'class-validator';
import { Direction } from '../../../shared/driven/prisma/generated/enums.js';
import { IdempotencyKeyExistingIdException } from '../../domain/errors/idempotency-key-existing-id-exception.error.js';
import { TransferInvalidAmountException } from '../../domain/errors/transfer-invalid-amount-exception.error.js';
import { WalletDifferentCurrencyException } from '../../domain/errors/wallet-different-currency-exception.error.js';
import { WalletNotFoundException } from '../../domain/errors/wallet-not-found-exception.error.js';
import { IdempotencyKey } from '../../domain/models/entities/idempotency-key.entity.js';
import { Transfer } from '../../domain/models/entities/transfer.entity.js';
import { Wallet } from '../../domain/models/entities/wallet.entity.js';
import { IdempotencyKeyRepositoryPort } from '../../domain/ports/idempotency-key.repository.port.js';
import { CreateTransferInput, TransferRepositoryPort } from '../../domain/ports/transfer.repository.port.js';
import { WalletRepositoryPort } from '../../domain/ports/wallet.repository.port.js';
import { CreateTransferInputDto } from '../../driving/dto/input/create-transfer.input-dto.js';

@Injectable()
export class TransferUseCase {
	readonly #idempotencyKeyRepository: IdempotencyKeyRepositoryPort;
	readonly #transferRepository: TransferRepositoryPort;
	readonly #walletRepository: WalletRepositoryPort;

	constructor(
		@Inject(IdempotencyKeyRepositoryPort)
		idempotencyKeyRepository: IdempotencyKeyRepositoryPort,
		@Inject(TransferRepositoryPort)
		transferRepository: TransferRepositoryPort,
		@Inject(WalletRepositoryPort) walletRepository: WalletRepositoryPort,
	) {
		this.#idempotencyKeyRepository = idempotencyKeyRepository;
		this.#transferRepository = transferRepository;
		this.#walletRepository = walletRepository;
	}

	private async getIdempotencyKeyById(idempotencyKey: string): Promise<IdempotencyKey | null> {
		return await this.#idempotencyKeyRepository.findById(idempotencyKey);
	}

	private async getWalletById(walletId: string): Promise<Wallet | null> {
		const targetedWallet = await this.#walletRepository.findById(walletId);

		return targetedWallet;
	}

	private isTransferAmountValid(amount: string): boolean {
		return (
			isNumber(Number(amount)) &&
			Number(amount) > Number.MIN_SAFE_INTEGER &&
			Number(amount) < Number.MAX_SAFE_INTEGER &&
			Number(amount) > 0
		);
	}

	async execute(idempotencyKeyId: string, payload: CreateTransferInputDto): Promise<Transfer[]> {
		const { debtorWalletId, creditorWalletId, amount } = payload;

		// Check if the idempotency key exists
		const idempotencyKey = await this.getIdempotencyKeyById(idempotencyKeyId);

		if (idempotencyKey !== null) {
			throw new IdempotencyKeyExistingIdException();
		}

		// Check if the amount is positive
		if (!this.isTransferAmountValid(amount)) {
			throw new TransferInvalidAmountException();
		}

		// Check if debtor wallet exist
		const debtorWallet = await this.getWalletById(debtorWalletId);

		if (debtorWallet === null) {
			throw new WalletNotFoundException(debtorWalletId);
		}

		// Check if creditor wallet exist
		const creditorWallet = await this.getWalletById(payload.creditorWalletId);

		if (creditorWallet === null) {
			throw new WalletNotFoundException(creditorWalletId);
		}

		// Check if both wallets' currency are the same
		if (debtorWallet.currency !== creditorWallet.currency) {
			throw new WalletDifferentCurrencyException(debtorWalletId, creditorWalletId);
		}

		// Create transfer's idempotency key
		const idempotencyKeyEntity = IdempotencyKey.create({
			id: idempotencyKeyId,
			payload: JSON.stringify(payload),
		});

		// Create both debit and credit transfers
		const debitTransfer = Transfer.create({
			amount: BigInt(amount),
			walletId: debtorWalletId,
			direction: Direction.DEBIT,
			idempotencyKeyId,
		});

		const creditTransfer = Transfer.create({
			amount: BigInt(amount),
			walletId: creditorWalletId,
			direction: Direction.CREDIT,
			idempotencyKeyId,
		});

		const createTransferInput: CreateTransferInput = {
			idempotencyKey: idempotencyKeyEntity,
			transfers: {
				debit: debitTransfer,
				credit: creditTransfer,
			},
		};

		await this.#transferRepository.createTransfers(createTransferInput);

		return [debitTransfer, creditTransfer];
	}
}
