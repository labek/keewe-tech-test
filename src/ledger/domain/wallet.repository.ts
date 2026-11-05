import type { Entry } from './entry.js';
import type { Wallet } from './wallet.js';

export abstract class WalletRepository {
	abstract findById(walletId: string): Promise<Wallet | null>;
	abstract findEntries(walletId: string): Promise<Entry[]>;
}
