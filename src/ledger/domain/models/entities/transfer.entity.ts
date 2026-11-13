import { randomUUID } from 'node:crypto';
import { isNumber, isUUID } from 'class-validator';
import { IdempotencyKeyFieldError } from '../../errors/idempotency-key-validation-exception.error.js';
import { TransferFieldError, TransferValidationException } from '../../errors/transfer-validation-exception.error.js';

/**
 * Constants ------------------------------
 */
const UUID_VERSION = 7;

/**
 * Types ------------------------------
 */
export const Currencies = ['EUR', 'USD'] as const;
export const Directions = ['DEBIT', 'CREDIT'] as const;

export type Currency = (typeof Currencies)[number];
export type Direction = (typeof Directions)[number];

export type TransferSnapshot = {
	id: string;
	amount: bigint;
	direction: Direction;
	idempotencyKeyId: string;
	walletId: string;
	createdAt: Date;
};

export type NewTransferInput = {
	amount: bigint;
	direction: Direction;
	idempotencyKeyId: string;
	walletId: string;
};

export class Transfer {
	private readonly _id: string;
	private readonly _amount: bigint;
	private readonly _direction: string;
	private readonly _idempotencyKeyId: string;
	private readonly _walletId: string;
	private readonly _createdAt: Date;

	private constructor(state: TransferSnapshot) {
		this._id = state.id;
		this._amount = state.amount;
		this._direction = state.direction;
		this._idempotencyKeyId = state.idempotencyKeyId;
		this._walletId = state.walletId;
		this._createdAt = state.createdAt;

		this.validate();
	}

	/**
	 * Factories ------------------------------
	 */
	public static create(input: NewTransferInput, now: Date = new Date()): Transfer {
		return new Transfer({
			id: randomUUID(),
			amount: input.amount,
			direction: input.direction,
			idempotencyKeyId: input.idempotencyKeyId,
			walletId: input.walletId,
			createdAt: now,
		});
	}

	public static rehydrate(state: TransferSnapshot): Transfer {
		return new Transfer(state);
	}

	/**
	 * Public methods ------------------------------
	 */
	public snapshot(): TransferSnapshot {
		return {
			id: this._id,
			amount: this._amount,
			direction: this._direction as Direction,
			idempotencyKeyId: this._idempotencyKeyId,
			walletId: this._walletId,
			createdAt: this._createdAt,
		};
	}

	/**
	 * Private methods ------------------------------
	 */
	private validate(): void {
		const errors: IdempotencyKeyFieldError[] = [];

		this.validateAmount(errors);
		this.validateDirection(errors);
		this.validateIdempotencyKeyId(errors);
		this.validateWalletId(errors);

		if (errors.length > 0) {
			throw new TransferValidationException(errors);
		}
	}

	private validateAmount(errors: TransferFieldError[]): void {
		if (isNumber(this._amount)) {
			errors.push({
				code: 'INVALID_TYPE',
				field: 'amount',
				message: `amount must be a stringified number`,
			});

			return;
		}

		const amount = Number(this._amount);

		if (amount < 0) {
			errors.push({
				code: 'INVALID_VALUE',
				field: 'amount',
				message: `amount must be a positive number`,
			});
		}
	}

	private validateDirection(errors: TransferFieldError[]): void {
		if (!Directions.includes(this._direction as Direction)) {
			errors.push({
				code: 'INVALID_TYPE',
				field: 'direction',
				message: `direction must be amongst valid directions: ${Directions.join(', ')}`,
			});
		}
	}

	private validateIdempotencyKeyId(errors: TransferFieldError[]): void {
		if (!isUUID(this._idempotencyKeyId, UUID_VERSION)) {
			errors.push({
				code: 'INVALID_FORMAT',
				field: 'idempotencyKeyId',
				message: `idempotencyKeyId must be a valid UUID`,
			});
		}
	}

	private validateWalletId(errors: TransferFieldError[]): void {
		if (!isUUID(this._walletId, UUID_VERSION)) {
			errors.push({
				code: 'INVALID_FORMAT',
				field: 'walletId',
				message: `walletId must be a valid UUID`,
			});
		}
	}
}
