import { Module } from '@nestjs/common';
import { LedgerModule } from './ledger/ledger.module.js';
import { SharedModule } from './shared/shared.module.js';

@Module({
	imports: [SharedModule, LedgerModule],
})
export class AppModule {}
