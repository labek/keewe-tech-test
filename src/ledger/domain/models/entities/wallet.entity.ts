export class Wallet {
	constructor(
		readonly id: string,
		readonly holderId: string,
		readonly currency: string,
		readonly balance: bigint,
	) {}
}
