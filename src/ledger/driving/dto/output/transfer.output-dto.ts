import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Directions, Transfer } from '../../../domain/models/entities/transfer.entity.js';

/**
 * Constants ------------------------------
 */
const UUID_VERSION = 7;

export class TransferResponse {
	@ApiProperty({
		description: 'ID of the transfer',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: String,
		format: 'uuid',
	})
	@IsUUID(UUID_VERSION)
	@IsNotEmpty()
	readonly id!: string;

	@ApiProperty({
		description: 'Positive amount in minor units',
		example: '1050',
		type: String,
	})
	@IsString()
	@IsNotEmpty()
	readonly amount!: string;

	@ApiProperty({
		description: 'Direction of the transfer',
		example: 'DEBIT',
		enum: Directions,
	})
	@IsEnum(Directions)
	@IsNotEmpty()
	readonly direction!: string;

	@ApiProperty({
		description: 'ID of the idempotency key',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: String,
		format: 'uuid',
	})
	@IsUUID(UUID_VERSION)
	@IsNotEmpty()
	readonly idempotencyKeyId!: string;

	@ApiProperty({
		description: 'Timestamp of the transfer',
		example: '2026-11-13T10:00:00.000Z',
		type: String,
		format: 'date-time',
	})
	@IsDateString({ strict: true })
	@IsNotEmpty()
	readonly createdAt!: string;

	constructor(transfer: Transfer) {
		this.id = transfer.snapshot().id;
		this.amount = transfer.snapshot().amount.toString();
		this.direction = transfer.snapshot().direction;
		this.idempotencyKeyId = transfer.snapshot().idempotencyKeyId;
		this.createdAt = transfer.snapshot().createdAt.toISOString();
	}
}
