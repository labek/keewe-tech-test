import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../../../app.module.js';
import { PrismaClient } from '../../../../shared/driven/prisma/generated/client.js';
import { IdempotencyKey } from '../../../domain/models/entities/idempotency-key.entity.js';
import { IdempotencyKeyRepositoryPort } from '../../../domain/ports/idempotency-key.repository.port.js';
import { IdempotencyKeyRepositoryAdapter } from '../idempotency-key.repository.adapter.js';

describe('IdempotencyKeyRepository (integration)', () => {
	// Data
	const NONEXISTENT_IDEMPOTENCY_KEY_ID = '019f4444-ffff-7000-8000-ffffffffffff';

	// Dependencies
	let app: INestApplication;
	let prisma: PrismaClient;
	let repository: IdempotencyKeyRepositoryPort;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();

		prisma = app.get(PrismaClient);
		repository = new IdempotencyKeyRepositoryAdapter(prisma);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('findById', () => {
		it('should throw an error when the key passed is not a string', async () => {
			// Arrange
			const invalidKey = 123 as unknown as string;

			// Act
			const received = () => repository.findById(invalidKey);

			// Assert
			await expect(received).rejects.toThrow(PrismaClientValidationError);
		});

		it('should throw an error when the key passed is an empty string', async () => {
			// Arrange
			const invalidKey = '';

			// Act
			const received = () => repository.findById(invalidKey);

			// Assert
			await expect(received).rejects.toThrow(PrismaClientKnownRequestError);
		});

		it('should return null when the key does not refer to an existing idempotency key', async () => {
			// Act
			const received = await repository.findById(NONEXISTENT_IDEMPOTENCY_KEY_ID);

			// Assert
			expect(received).toBeNull();
		});

		it('should return the idempotency key when the key refers to an existing idempotency key', async () => {
			// Arrange
			const idempotencyKeyId = '01a1d089-aad3-709e-9704-1296459678f5';

			const idempotencyKey = IdempotencyKey.create({
				id: idempotencyKeyId,
				payload: JSON.stringify({ foo: 'bar' }),
			});

			await prisma.idempotencyKey.create({ data: idempotencyKey.snapshot() });

			// Act
			const received = await repository.findById(idempotencyKeyId);

			// Assert
			expect(received).toEqual(idempotencyKey);
		});
	});

	describe('insert', () => {
		it('should throw an error when the idempotency key to insert already exists', async () => {
			// Arrange
			const idempotencyKey = IdempotencyKey.create({
				id: '01a1d089-aad3-709e-9704-1296459678f5',
				payload: JSON.stringify({ foo: 'bar' }),
			});

			await prisma.idempotencyKey.create({ data: idempotencyKey.snapshot() });

			// Act
			const received = () => repository.insert(idempotencyKey);

			// Assert
			await expect(received).rejects.toThrow(PrismaClientKnownRequestError);
		});

		it('should create the idempotency key when the key and fingerprint are valid', async () => {
			// Arrange
			const idempotencyKey = IdempotencyKey.create({
				id: '01a1d089-aad3-709e-9704-1296459678f5',
				payload: JSON.stringify({ foo: 'bar' }),
			});

			// Act
			const received = await repository.insert(idempotencyKey);

			// Assert
			expect(received).toEqual(idempotencyKey);
		});
	});
});
