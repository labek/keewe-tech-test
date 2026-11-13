import { Inject, Injectable } from '@nestjs/common';
import { Direction, Prisma, PrismaClient } from '../../../shared/driven/prisma/generated/client.js';
import { TransferCreateInput } from '../../../shared/driven/prisma/generated/models.js';
import { WalletInsufficientFundException } from '../../domain/errors/wallet-insufficient-fund-exception.error.js';
import { WalletNotFoundException } from '../../domain/errors/wallet-not-found-exception.error.js';
import { Transfer } from '../../domain/models/entities/transfer.entity.js';
import { Wallet } from '../../domain/models/entities/wallet.entity.js';
import { CreateTransferInput, TransferRepositoryPort } from '../../domain/ports/transfer.repository.port.js';

const COMMIT_ISOLATION_LEVEL = 'Serializable';

@Injectable()
export class TransferRepositoryAdapter implements TransferRepositoryPort {
	readonly #prisma: PrismaClient;

	constructor(@Inject(PrismaClient) prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	private async updateWalletBalance(walletId: string, direction: Direction, amount: bigint): Promise<void> {
		// Lock the specific wallet row using raw SQL
		const wallets = await this.#prisma.$queryRaw<{ balance: number }[]>`
            SELECT balance
            FROM ledger.wallet
            WHERE id = ${walletId}
            FOR UPDATE
        `;

		if (!wallets?.length) {
			throw new WalletNotFoundException(walletId);
		}

		const wallet = wallets[0] as unknown as Wallet;

		// Check balance if debiting
		const currentBalance = Number(wallet.balance);

		if (direction === Direction.DEBIT && currentBalance < Number(amount)) {
			throw new WalletInsufficientFundException(walletId);
		}

		// Recompute new balance and update wallet balance
		const updatedBalance =
			direction === Direction.DEBIT ? currentBalance - Number(amount) : currentBalance + Number(amount);

		await this.#prisma.wallet.update({
			where: { id: walletId },
			data: {
				balance: BigInt(updatedBalance),
			},
		});
	}

	async createTransfers(input: CreateTransferInput): Promise<Transfer[]> {
		const { idempotencyKey, transfers } = input;

		// Debit
		const debitTransfer = transfers.debit.snapshot();

		const debitTransferData: TransferCreateInput = {
			id: debitTransfer.id,
			amount: debitTransfer.amount,
			direction: 'DEBIT',
			wallet: {
				connect: {
					id: debitTransfer.walletId,
				},
			},
			idempotencyKey: {
				connect: {
					id: idempotencyKey.snapshot().id,
				},
			},
		};

		// Credit
		const creditTransfer = transfers.credit.snapshot();

		const creditTransferData: TransferCreateInput = {
			id: creditTransfer.id,
			amount: creditTransfer.amount,
			direction: 'CREDIT',
			wallet: {
				connect: {
					id: creditTransfer.walletId,
				},
			},
			idempotencyKey: {
				connect: {
					id: idempotencyKey.snapshot().id,
				},
			},
		};

		const transfersResponse = await this.#prisma.$transaction(
			async (tx: Prisma.TransactionClient) => {
				// Create transfer's idempotency key
				await tx.idempotencyKey.create({ data: idempotencyKey.snapshot() });

				// Lock wallets and update balances
				await Promise.all([
					this.updateWalletBalance(debitTransfer.walletId, Direction.DEBIT, debitTransfer.amount),
					this.updateWalletBalance(creditTransfer.walletId, Direction.CREDIT, creditTransfer.amount),
				]);

				// Insert both debit and credit transfers
				const [debitTransferResult, creditTransferResult] = await Promise.all([
					tx.transfer.create({ data: debitTransferData }),
					tx.transfer.create({ data: creditTransferData }),
				]);

				// TODO: log movement on both wallets

				const updatedDebitTransfer = Transfer.rehydrate({
					id: debitTransferResult.id,
					amount: debitTransferResult.amount,
					createdAt: debitTransferResult.createdAt,
					direction: debitTransferResult.direction,
					idempotencyKeyId: debitTransferResult.idempotencyKeyId,
					walletId: debitTransferResult.walletId,
				});

				const updatedCreditTransfer = Transfer.rehydrate({
					id: creditTransferResult.id,
					amount: creditTransferResult.amount,
					createdAt: creditTransferResult.createdAt,
					direction: creditTransferResult.direction,
					idempotencyKeyId: creditTransferResult.idempotencyKeyId,
					walletId: creditTransferResult.walletId,
				});

				return [updatedDebitTransfer, updatedCreditTransfer];
			},
			{
				isolationLevel: COMMIT_ISOLATION_LEVEL,
			},
		);

		return transfersResponse;
	}
}
