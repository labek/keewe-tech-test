import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Idempotency key validation failed';
const DEFAULT_DETAIL = 'The idempotency key payload does not satisfy the ledger business invariants.';

export type IdempotencyKeyFieldError = {
	field: string;
	code: string;
	message: string;
};

export type IdempotencyKeyValidationExceptionOptions = {
	title?: string;
	detail?: string;
	cause?: unknown;
};

export class IdempotencyKeyValidationException extends UnprocessableEntityException {
	public constructor(errors: IdempotencyKeyFieldError[], options: IdempotencyKeyValidationExceptionOptions = {}) {
		if (errors.length === 0) {
			throw new Error('IdempotencyKeyValidationException requires at least one field error');
		}

		const title = options.title ?? DEFAULT_TITLE;
		const detail = options.detail ?? DEFAULT_DETAIL;

		super(
			{
				detail,
				errors,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title,
			},
			{ cause: options.cause, description: detail },
		);

		this.name = this.constructor.name;
	}

	public get fieldErrors(): IdempotencyKeyFieldError[] {
		const response = this.getResponse() as { errors?: IdempotencyKeyFieldError[] };

		return response.errors ?? [];
	}
}
