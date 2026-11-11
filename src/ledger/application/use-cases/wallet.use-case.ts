import { Inject, Injectable } from '@nestjs/common';
import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error.js';
import type { Entry } from '../../domain/models/entities/entry.js';
import type { Wallet } from '../../domain/models/entities/wallet.js';
import { WalletPort } from '../../domain/ports/wallet.port.js';

@Injectable()
export class WalletUseCase {
	readonly #wallets: WalletPort;

	constructor(@Inject(WalletPort) wallets: WalletPort) {
		this.#wallets = wallets;
	}

	async getWallet(walletId: string): Promise<Wallet> {
		const wallet = await this.#wallets.findById(walletId);
		if (!wallet) {
			throw new WalletNotFoundError(walletId);
		}

		return wallet;
	}

	async listEntries(walletId: string): Promise<Entry[]> {
		await this.getWallet(walletId);

		return this.#wallets.findEntries(walletId);
	}
}
