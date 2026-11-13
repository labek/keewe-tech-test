import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Constants ------------------------------
 */
const UUID_VERSION = 7;
const IDEMPOTENCY_KEY_ID_MAX_LENGTH = 36;
const IDEMPOTENCY_KEY_ID_PATTERN =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class CreateIdempotencyKeyInputDto {
	@ApiProperty({
		description: 'Idempotency key ID',
		example: '01a1cb9e-1dce-704e-99d9-4bbfd231f730',
		format: 'uuid',
		maxLength: IDEMPOTENCY_KEY_ID_MAX_LENGTH,
		pattern: IDEMPOTENCY_KEY_ID_PATTERN,
	})
	@IsUUID(UUID_VERSION)
	public readonly id!: string;

	@ApiProperty({
		description: 'Transfer payload',
		example: {
			crebtorWalletId: '123e4567-e89b-12d3-a456-426614174000',
			debtorWalletId: '123e4567-e89b-12d3-a456-426614174000',
			amount: 100,
			currency: 'EUR',
			direction: 'CREDIT',
		},
		format: 'json',
	})
	@IsJSON()
	@IsNotEmpty()
	public readonly payload!: string;
}
