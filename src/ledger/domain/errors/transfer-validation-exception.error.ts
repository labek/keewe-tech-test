import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Transfer validation failed';
const DEFAULT_DETAIL = 'The transfer does not satisfy the ledger business invariants.';

export type TransferFieldError = {
	field: string;
	code: string;
	message: string;
};

export type TransferValidationExceptionOptions = {
	title?: string;
	detail?: string;
	cause?: unknown;
};

export class TransferValidationException extends UnprocessableEntityException {
	public constructor(errors: TransferFieldError[], options: TransferValidationExceptionOptions = {}) {
		if (errors.length === 0) {
			throw new Error('TransferValidationException requires at least one field error');
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

	public get fieldErrors(): TransferFieldError[] {
		const response = this.getResponse() as { errors?: TransferFieldError[] };

		return response.errors ?? [];
	}
}
