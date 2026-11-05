import { Inject, Module, type OnApplicationShutdown, type OnModuleInit, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './driven/prisma/generated/client.js';
import { sharedConfig } from './shared.config.js';

@Module({
	providers: [
		{
			provide: PrismaClient,
			useFactory: () => new PrismaClient({ adapter: new PrismaPg({ connectionString: sharedConfig.databaseUrl }) }),
		},
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
		},
	],
	exports: [PrismaClient],
})
export class SharedModule implements OnModuleInit, OnApplicationShutdown {
	readonly #prisma: PrismaClient;

	constructor(@Inject(PrismaClient) prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async onModuleInit(): Promise<void> {
		await this.#prisma.$connect();
	}

	async onApplicationShutdown(): Promise<void> {
		await this.#prisma.$disconnect();
	}
}
