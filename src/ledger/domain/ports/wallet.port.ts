import type { Entry } from '../models/entities/entry.js';
import type { Wallet } from '../models/entities/wallet.js';

export abstract class WalletPort {
	abstract findById(walletId: string): Promise<Wallet | null>;
	abstract findEntries(walletId: string): Promise<Entry[]>;
}
