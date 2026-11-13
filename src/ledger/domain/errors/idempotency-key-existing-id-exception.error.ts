import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Idempotency Key Already Exists';

export class IdempotencyKeyExistingIdException extends UnprocessableEntityException {
	public constructor() {
		const detail = `Idempotency key ID already exists.`;

		super(
			{
				detail,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'IdempotencyKeyExistingIdException';
	}
}
