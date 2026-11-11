import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module.js';
import { WalletUseCase } from './application/use-cases/wallet.use-case.js';
import { WalletPort } from './domain/ports/wallet.port.js';
import { WalletRepositoryAdapter } from './driven/adapters/wallet.repository.adapter.js';
import { WalletController } from './driving/controllers/wallet.controller.js';

@Module({
	imports: [SharedModule],
	controllers: [WalletController],
	providers: [WalletUseCase, { provide: WalletPort, useClass: WalletRepositoryAdapter }],
})
export class LedgerModule {}
