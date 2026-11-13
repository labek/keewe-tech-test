import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateIdempotencyKeyInputDto } from '../create-idempotency-key.input-dto.js';

function makeDto(overrides: Partial<CreateIdempotencyKeyInputDto>): CreateIdempotencyKeyInputDto {
	return Object.assign(new CreateIdempotencyKeyInputDto(), overrides);
}

describe('CreateIdempotencyKeyInputDto', () => {
	describe('"id" field', () => {
		const fieldName = 'id';

		it.each([
			{
				testTitleCondition: 'not a string',
				fieldValue: 123 as unknown as string,
			},
			{
				testTitleCondition: 'undefined',
				fieldValue: undefined,
			},
			{
				testTitleCondition: 'null',
				fieldValue: null as unknown as string,
			},
			{
				testTitleCondition: 'an empty string',
				fieldValue: '',
			},
			{
				testTitleCondition: 'not a valid UUID',
				fieldValue: 'invalid-uuid',
			},
		])('should return some errors error when "key" field is $testTitleCondition', async ({ fieldValue }) => {
			// Arrange
			const invalidDto = makeDto({
				[fieldName]: fieldValue,
				payload: JSON.stringify({ foo: 'bar' }),
			});

			// Act
			const errors = await validate(invalidDto);
			const expectedConstraint = {
				isUuid: `${fieldName} must be a UUID`,
			};

			// Assert
			expect(errors).toHaveLength(1);
			expect(errors[0]?.property).toBe(fieldName);
			expect(errors[0]?.constraints).toStrictEqual(expectedConstraint);
		});

		it(`should validate payload against validation rules when "${fieldName}" field is a valid UUID`, async () => {
			// Arrange
			const dto = makeDto({
				[fieldName]: '01a08142-937c-715a-bdb7-da50eea34ea1',
				payload: JSON.stringify({ foo: 'bar' }),
			});

			// Act
			const errors = await validate(dto);

			// Assert
			expect(errors).toHaveLength(0);
		});
	});

	describe('"payload" field', () => {
		const fieldName = 'payload';

		it.each([
			{
				testTitleCondition: 'not a string',
				fieldValue: 123 as unknown as string,
				expectedConstraint: {
					isJson: `${fieldName} must be a json string`,
				},
			},
			{
				testTitleCondition: 'undefined',
				fieldValue: undefined,
				expectedConstraint: {
					isJson: `${fieldName} must be a json string`,
					isNotEmpty: `${fieldName} should not be empty`,
				},
			},
			{
				testTitleCondition: 'null',
				fieldValue: null as unknown as string,
				expectedConstraint: {
					isJson: `${fieldName} must be a json string`,
				},
			},
			{
				testTitleCondition: 'an empty string',
				fieldValue: '',
				expectedConstraint: {
					isJson: `${fieldName} must be a json string`,
				},
			},
		])(
			'should return some errors error when "payload" field is $testTitleCondition',
			async ({ fieldValue, expectedConstraint }) => {
				// Arrange
				const invalidDto = makeDto({
					id: '01a08142-937c-715a-bdb7-da50eea34ea1',
					[fieldName]: JSON.stringify(fieldValue),
				});

				// Act
				const errors = await validate(invalidDto);

				// Assert
				expect(errors).toHaveLength(1);
				expect(errors[0]?.property).toBe(fieldName);
				expect(errors[0]?.constraints).toStrictEqual(expectedConstraint);
			},
		);

		it(`should validate payload against validation rules when "${fieldName}" field is a valid stringified JSON object`, async () => {
			// Arrange
			const dto = makeDto({
				id: '01a08142-937c-715a-bdb7-da50eea34ea1',
				[fieldName]: JSON.stringify({ foo: 'bar' }),
			});

			// Act
			const errors = await validate(dto);

			// Assert
			expect(errors).toHaveLength(0);
		});
	});
});
