import { HttpStatus, NotFoundException } from '@nestjs/common';

const DEFAULT_TITLE = 'Webhook Event Not Found';

export class IdempotencyKeyIdNonexistentHeaderException extends NotFoundException {
	public constructor() {
		const detail = `Idempotency-Key header is required.`;

		super(
			{
				detail,
				status: HttpStatus.NOT_FOUND,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'IdempotencyKeyIdNonexistentHeaderException';
	}
}
