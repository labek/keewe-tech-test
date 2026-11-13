import { Transfer } from '../models/entities/transfer.entity.js';
import type { Wallet } from '../models/entities/wallet.entity.js';

export abstract class WalletRepositoryPort {
	abstract findById(walletId: string): Promise<Wallet | null>;
	abstract findTransfers(walletId: string): Promise<Transfer[]>;
}
