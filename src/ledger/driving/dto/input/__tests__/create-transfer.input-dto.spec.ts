import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateTransferInputDto } from '../create-transfer.input-dto.js';

function makeDto(overrides: Partial<CreateTransferInputDto>): CreateTransferInputDto {
	return Object.assign(new CreateTransferInputDto(), overrides);
}

describe('CreateTransferInputDto', () => {
	const validDto = makeDto({
		creditorWalletId: '01a1d4e0-b8d0-716b-b2a2-6581848e1968',
		debtorWalletId: '01a1d4e0-93a8-7639-874e-5bceff962cc0',
		amount: '1050',
	});

	describe('"creditorWalletId" field', () => {
		const fieldName = 'creditorWalletId';

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
		])(
			'should return some errors error when "creditorWalletId" field is $testTitleCondition',
			async ({ fieldValue }) => {
				// Arrange
				const invalidDto = makeDto({ ...validDto, [fieldName]: fieldValue });

				// Act
				const errors = await validate(invalidDto);
				const expectedConstraint = {
					isUuid: `${fieldName} must be a UUID`,
				};

				// Assert
				expect(errors).toHaveLength(1);
				expect(errors[0]?.property).toBe(fieldName);
				expect(errors[0]?.constraints).toStrictEqual(expectedConstraint);
			},
		);

		it(`should validate payload against validation rules when "${fieldName}" field is a valid UUID`, async () => {
			// Act
			const errors = await validate(validDto);

			// Assert
			expect(errors).toHaveLength(0);
		});
	});

	describe('"debtorWalletId" field', () => {
		const fieldName = 'debtorWalletId';

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
		])(
			'should return something errors error when "creditorWalletId" field is $testTitleCondition',
			async ({ fieldValue }) => {
				// Arrange
				const invalidDto = makeDto({ ...validDto, [fieldName]: fieldValue });

				// Act
				const errors = await validate(invalidDto);
				const expectedConstraint = {
					isUuid: `${fieldName} must be a UUID`,
				};

				// Assert
				expect(errors).toHaveLength(1);
				expect(errors[0]?.property).toBe(fieldName);
				expect(errors[0]?.constraints).toStrictEqual(expectedConstraint);
			},
		);

		it(`should validate payload against validation rules when "${fieldName}" field is a valid UUID`, async () => {
			// Act
			const errors = await validate(validDto);

			// Assert
			expect(errors).toHaveLength(0);
		});
	});

	describe('"amount" field', () => {
		const fieldName = 'amount';

		const stringConstraint = {
			isString: `${fieldName} must be a string`,
		};

		const matchesConstraint = {
			matches: `${fieldName} must match /^[1-9]\\d*$/ regular expression`,
		};

		it.each([
			{
				testTitleCondition: 'undefined',
				fieldValue: undefined,
				expectedConstraints: { ...stringConstraint, ...matchesConstraint },
			},
			{
				testTitleCondition: 'null',
				fieldValue: null as unknown as string,
				expectedConstraints: { ...stringConstraint, ...matchesConstraint },
			},
			{
				testTitleCondition: 'an empty string',
				fieldValue: '',
				expectedConstraints: { ...matchesConstraint },
			},
			{
				testTitleCondition: 'not a stringified number',
				fieldValue: 'foobar',
				expectedConstraints: { ...matchesConstraint },
			},
			{
				testTitleCondition: 'not a stringified positive number',
				fieldValue: '0',
				expectedConstraints: { ...matchesConstraint },
			},
		])(
			'should return some errors error when "amount" field is $testTitleCondition',
			async ({ fieldValue, expectedConstraints }) => {
				// Arrange
				const invalidDto = makeDto({ ...validDto, [fieldName]: fieldValue });

				// Act
				const errors = await validate(invalidDto);

				// Assert
				expect(errors).toHaveLength(1);
				expect(errors[0]?.property).toBe(fieldName);
				expect(errors[0]?.constraints).toStrictEqual(expectedConstraints);
			},
		);

		it(`should validate payload against validation rules when "${fieldName}" field is a valid stringified positive number`, async () => {
			// Act
			const errors = await validate(validDto);

			// Assert
			expect(errors).toHaveLength(0);
		});
	});
});
