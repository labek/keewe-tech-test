import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

const DEFAULT_TITLE = 'Wallet Insufficient Fund';

export class WalletInsufficientFundException extends UnprocessableEntityException {
	public constructor(walletId: string) {
		const detail = `Debtor wallet ${walletId} has insufficient funds.`;

		super(
			{
				detail,
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'WalletInsufficientFundException';
	}
}
