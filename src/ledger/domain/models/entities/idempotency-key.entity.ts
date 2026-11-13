import { createHash } from 'node:crypto';
import { isUUID } from 'class-validator';
import {
	IdempotencyKeyFieldError,
	IdempotencyKeyValidationException,
} from '../../errors/idempotency-key-validation-exception.error.js';

/**
 * Constants ------------------------------
 */
const FINGERPRINT_MAX_LENGTH = 64;
const FINGERPRINT_PATTERN = /\b[A-Fa-f0-9]{64}\b/;
const UUID_VERSION = 7;

/**
 * Types ------------------------------
 */
export type IdempotencyKeySnapshot = {
	id: string;
	fingerprint: string;
	createdAt: Date;
};

export type NewIdempotencyKeyInput = {
	id: string;
	payload: string;
};

export class IdempotencyKey {
	private readonly _id: string;
	private readonly _fingerprint: string;
	private readonly _createdAt: Date;

	private constructor(state: IdempotencyKeySnapshot) {
		this._id = state.id;
		this._fingerprint = state.fingerprint;
		this._createdAt = state.createdAt;

		this.validate();
	}

	/**
	 * Factories ------------------------------
	 */
	public static create(input: NewIdempotencyKeyInput, now: Date = new Date()): IdempotencyKey {
		return new IdempotencyKey({
			createdAt: now,
			fingerprint: IdempotencyKey.generateFingerprint(input.payload),
			id: input.id,
		});
	}

	public static rehydrate(state: IdempotencyKeySnapshot): IdempotencyKey {
		return new IdempotencyKey(state);
	}

	public static generateFingerprint(payload: string): string {
		return createHash('sha256').update(payload).digest('hex');
	}

	/**
	 * Public methods ------------------------------
	 */
	public snapshot(): IdempotencyKeySnapshot {
		return {
			createdAt: this._createdAt,
			fingerprint: this._fingerprint,
			id: this._id,
		};
	}

	/**
	 * Private methods ------------------------------
	 */
	private validate(): void {
		const errors: IdempotencyKeyFieldError[] = [];

		this.validateId(errors);
		this.validateFingerprint(errors);

		if (errors.length > 0) {
			throw new IdempotencyKeyValidationException(errors);
		}
	}

	private validateId(errors: IdempotencyKeyFieldError[]): void {
		if (!isUUID(this._id, UUID_VERSION)) {
			errors.push({
				code: 'INVALID_FORMAT',
				field: 'id',
				message: `id must be a valid UUID`,
			});
		}
	}

	private validateFingerprint(errors: IdempotencyKeyFieldError[]) {
		if (this._fingerprint.length !== FINGERPRINT_MAX_LENGTH) {
			errors.push({
				code: 'INVALID_LENGTH',
				field: 'fingerprint',
				message: `fingerprint must be ${FINGERPRINT_MAX_LENGTH} characters long`,
			});
		}

		if (!FINGERPRINT_PATTERN.test(this._fingerprint)) {
			errors.push({
				code: 'INVALID_FORMAT',
				field: 'fingerprint',
				message: `fingerprint must match ${FINGERPRINT_PATTERN.toString()}`,
			});
		}
	}
}
