import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module.js';
import { WalletService } from './application/wallet.service.js';
import { WalletRepository } from './domain/wallet.repository.js';
import { PrismaWalletRepository } from './driven/prisma-wallet.repository.js';
import { WalletController } from './driving/wallet.controller.js';

@Module({
	imports: [SharedModule],
	controllers: [WalletController],
	providers: [WalletService, { provide: WalletRepository, useClass: PrismaWalletRepository }],
})
export class LedgerModule {}
