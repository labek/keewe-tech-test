import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Idempotency Key Different Payload';

export class IdempotencyKeyDifferentPayloadException extends UnprocessableEntityException {
	public constructor() {
		const detail = `Idempotency key payload is different from the previous one.`;

		super(
			{
				detail,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'IdempotencyKeyDifferentPayloadException';
	}
}
