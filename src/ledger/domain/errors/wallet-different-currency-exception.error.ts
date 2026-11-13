import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Wallet Different Currency';

export class WalletDifferentCurrencyException extends UnprocessableEntityException {
	public constructor(creditorWalletId: string, debtorWalletId: string) {
		const detail = `Wallet ${creditorWalletId} and ${debtorWalletId} use different currencies.`;

		super(
			{
				detail,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'WalletDifferentCurrencyException';
	}
}
