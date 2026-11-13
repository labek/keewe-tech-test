import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module.js';
import { IdempotencyKeyUseCase } from './application/use-cases/idempotency-key.use-case.js';
import { TransferUseCase } from './application/use-cases/transfer.use-case.js';
import { WalletUseCase } from './application/use-cases/wallet.use-case.js';
import { IdempotencyKeyRepositoryPort } from './domain/ports/idempotency-key.repository.port.js';
import { TransferRepositoryPort } from './domain/ports/transfer.repository.port.js';
import { WalletRepositoryPort } from './domain/ports/wallet.repository.port.js';
import { IdempotencyKeyRepositoryAdapter } from './driven/adapters/idempotency-key.repository.adapter.js';
import { TransferRepositoryAdapter } from './driven/adapters/transfer.repository.js';
import { WalletRepositoryAdapter } from './driven/adapters/wallet.repository.adapter.js';
import { TransferController } from './driving/controllers/transfer.controller.js';
import { WalletController } from './driving/controllers/wallet.controller.js';

@Module({
	imports: [SharedModule],
	controllers: [TransferController, WalletController],
	providers: [
		IdempotencyKeyUseCase,
		TransferUseCase,
		WalletUseCase,
		{ provide: IdempotencyKeyRepositoryPort, useClass: IdempotencyKeyRepositoryAdapter },
		{ provide: TransferRepositoryPort, useClass: TransferRepositoryAdapter },
		{ provide: WalletRepositoryPort, useClass: WalletRepositoryAdapter },
	],
})
export class LedgerModule {}
