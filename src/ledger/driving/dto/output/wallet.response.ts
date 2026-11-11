import { ApiProperty } from '@nestjs/swagger';
import type { Entry, EntryDirection } from '../../../domain/models/entities/entry.js';
import type { Wallet } from '../../../domain/models/entities/wallet.js';

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

export class EntryResponse {
	@ApiProperty({ type: String, format: 'uuid' })
	readonly id: string;

	@ApiProperty({ enum: ['DEBIT', 'CREDIT'] })
	readonly direction: EntryDirection;

	@ApiProperty({
		type: String,
		example: '1050',
		description: 'Positive amount in minor units',
	})
	readonly amount: string;

	@ApiProperty({ type: String, format: 'date-time' })
	readonly createdAt: string;

	constructor(entry: Entry) {
		this.id = entry.id;
		this.direction = entry.direction;
		this.amount = entry.amount.toString();
		this.createdAt = entry.createdAt.toISOString();
	}
}
