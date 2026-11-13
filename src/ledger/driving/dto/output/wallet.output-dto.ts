import { ApiProperty } from '@nestjs/swagger';
import type { Wallet } from '../../../domain/models/entities/wallet.entity.js';

export class WalletResponse {
	@ApiProperty({ type: String, format: 'uuid' })
	readonly id: string;

	@ApiProperty({ type: String, format: 'uuid' })
	readonly holderId: string;

	@ApiProperty({ type: String, example: 'EUR' })
	readonly currency: string;

	@ApiProperty({
		type: String,
		example: '1500000',
		description: 'Balance in minor units',
	})
	readonly balance: string;

	constructor(wallet: Wallet) {
		this.id = wallet.id;
		this.holderId = wallet.holderId;
		this.currency = wallet.currency;
		this.balance = wallet.balance.toString();
	}
}
