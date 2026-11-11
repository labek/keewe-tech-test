export class WalletNotFoundError extends Error {
	constructor(walletId: string) {
		super(`Wallet ${walletId} not found`);
		this.name = 'WalletNotFoundError';
	}
}
