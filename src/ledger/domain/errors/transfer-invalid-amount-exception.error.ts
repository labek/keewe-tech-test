import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Webhook Event Not Found';

export class TransferInvalidAmountException extends UnprocessableEntityException {
	public constructor() {
		const detail = `Transfer amount must be a valid positive number.`;

		super(
			{
				detail,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'TransferInvalidAmountException';
	}
}
