import { Inject, Injectable } from '@nestjs/common';
import type { Entry } from '../domain/entry.js';
import type { Wallet } from '../domain/wallet.js';
import { WalletRepository } from '../domain/wallet.repository.js';
import { WalletNotFoundError } from '../domain/wallet-not-found.error.js';

@Injectable()
export class WalletService {
	readonly #wallets: WalletRepository;

	constructor(@Inject(WalletRepository) wallets: WalletRepository) {
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
