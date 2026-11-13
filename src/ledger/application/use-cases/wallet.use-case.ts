import { Inject, Injectable } from '@nestjs/common';
import { WalletNotFoundException } from '../../domain/errors/wallet-not-found-exception.error.js';
import { Transfer } from '../../domain/models/entities/transfer.entity.js';
import type { Wallet } from '../../domain/models/entities/wallet.entity.js';
import { WalletRepositoryPort } from '../../domain/ports/wallet.repository.port.js';

@Injectable()
export class WalletUseCase {
	readonly #wallets: WalletRepositoryPort;

	constructor(@Inject(WalletRepositoryPort) wallets: WalletRepositoryPort) {
		this.#wallets = wallets;
	}

	async getWallet(walletId: string): Promise<Wallet> {
		const wallet = await this.#wallets.findById(walletId);
		if (!wallet) {
			throw new WalletNotFoundException(walletId);
		}

		return wallet;
	}

	async listTransfers(walletId: string): Promise<Transfer[]> {
		await this.getWallet(walletId);

		return this.#wallets.findTransfers(walletId);
	}
}
