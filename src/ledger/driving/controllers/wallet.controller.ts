import { Controller, Get, Inject, Param, ParseUUIDPipe, UseFilters } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WalletUseCase } from '../../application/use-cases/wallet.use-case.js';
import { TransferResponse } from '../dto/output/transfer.output-dto.js';
import { WalletResponse } from '../dto/output/wallet.output-dto.js';
import { WalletNotFoundFilter } from '../filters/wallet-not-found.filter.js';

@ApiTags('Wallets')
@Controller('wallets')
@UseFilters(WalletNotFoundFilter)
export class WalletController {
	readonly #wallets: WalletUseCase;

	constructor(@Inject(WalletUseCase) wallets: WalletUseCase) {
		this.#wallets = wallets;
	}

	@Get(':walletId')
	@ApiOkResponse({ type: WalletResponse })
	@ApiBadRequestResponse({ description: 'walletId is not a UUID' })
	@ApiNotFoundResponse({ description: 'Wallet not found' })
	async getWallet(@Param('walletId', ParseUUIDPipe) walletId: string): Promise<WalletResponse> {
		return new WalletResponse(await this.#wallets.getWallet(walletId));
	}

	@Get(':walletId/transfers')
	@ApiOkResponse({ type: [TransferResponse] })
	@ApiBadRequestResponse({ description: 'walletId is not a UUID' })
	@ApiNotFoundResponse({ description: 'Wallet not found' })
	async listTransfers(@Param('walletId', ParseUUIDPipe) walletId: string): Promise<TransferResponse[]> {
		const transfers = await this.#wallets.listTransfers(walletId);

		return transfers.map((transfer) => new TransferResponse(transfer));
	}
}
