import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches, Validate } from 'class-validator';

/**
 * Constants ------------------------------
 */
const UUID_VERSION = 7;
const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const POSITIVE_AMOUNT_PATTERN = /^[1-9]\d*$/;

export class CreateTransferInputDto {
	@ApiProperty({
		description: 'Creditor wallet ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
		pattern: UUID_PATTERN,
	})
	@IsUUID(UUID_VERSION)
	public readonly creditorWalletId!: string;

	@ApiProperty({
		description: 'Debtor wallet ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
		pattern: UUID_PATTERN,
	})
	@IsUUID(UUID_VERSION)
	public readonly debtorWalletId!: string;

	@ApiProperty({
		description: 'Positive amount in minor units',
		example: '1050',
		format: 'string',
		pattern: POSITIVE_AMOUNT_PATTERN,
	})
	@IsString()
	@Matches(POSITIVE_AMOUNT_PATTERN)
	@Validate((value: string) => Number(value) > 0, { message: 'Amount must be a positive number' })
	public readonly amount!: string;
}
