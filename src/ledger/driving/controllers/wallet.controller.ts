import { Controller, Get, Inject, Param, ParseUUIDPipe, UseFilters } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WalletUseCase } from '../../application/use-cases/wallet.use-case.js';
import { EntryResponse, WalletResponse } from '../dto/output/wallet.response.js';
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

	@Get(':walletId/entries')
	@ApiOkResponse({ type: [EntryResponse] })
	@ApiBadRequestResponse({ description: 'walletId is not a UUID' })
	@ApiNotFoundResponse({ description: 'Wallet not found' })
	async listEntries(@Param('walletId', ParseUUIDPipe) walletId: string): Promise<EntryResponse[]> {
		const entries = await this.#wallets.listEntries(walletId);

		return entries.map((entry) => new EntryResponse(entry));
	}
}
