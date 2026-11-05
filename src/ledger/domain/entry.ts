export type EntryDirection = 'DEBIT' | 'CREDIT';

export class Entry {
	constructor(
		readonly id: string,
		readonly walletId: string,
		readonly direction: EntryDirection,
		readonly amount: bigint,
		readonly createdAt: Date,
	) {}
}
