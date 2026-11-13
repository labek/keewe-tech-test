import { HttpStatus, NotFoundException } from '@nestjs/common';

const DEFAULT_TITLE = 'Wallet Not Found';

export class WalletNotFoundException extends NotFoundException {
	public constructor(walletId: string) {
		const detail = `Wallet ${walletId} cannot be found.`;

		super(
			{
				detail,
				status: HttpStatus.NOT_FOUND,
				title: DEFAULT_TITLE,
			},
			{ description: detail },
		);

		this.name = 'WalletNotFoundException';
	}
}
