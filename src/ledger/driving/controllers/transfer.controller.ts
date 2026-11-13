import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiConflictResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case.js';
import { IdempotencyKeyIdNonexistentHeaderException } from '../../domain/errors/idempotency-key-id-nonexistent-header-exception.error.js';
import { CreateTransferInputDto } from '../dto/input/create-transfer.input-dto.js';
import { TransferResponse } from '../dto/output/transfer.output-dto.js';

@ApiTags('Transfers')
@Controller('transfers')
export class TransferController {
	readonly #transfers: TransferUseCase;

	constructor(@Inject(TransferUseCase) transfers: TransferUseCase) {
		this.#transfers = transfers;
	}

	@Post()
	@ApiAcceptedResponse({ description: 'Transfer accepted', type: TransferResponse })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiUnprocessableEntityResponse({ description: 'Unprocessable entity' })
	async createTransfer(
		@Headers('Idempotency-Key') idempotencyKeyId: string | undefined,
		@Body() payload: CreateTransferInputDto,
	): Promise<TransferResponse[]> {
		if (idempotencyKeyId === undefined) {
			throw new IdempotencyKeyIdNonexistentHeaderException();
		}

		const transfers = await this.#transfers.execute(idempotencyKeyId, payload);

		return transfers.map((transfer) => new TransferResponse(transfer));
	}
}
