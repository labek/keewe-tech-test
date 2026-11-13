import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		sequence: { shuffle: process.env.CI === 'true' },
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.(!integration|!e2e).spec.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'integration',
					include: ['src/**/*.integration.spec.ts', 'src/**/*.e2e.spec.ts'],
					globalSetup: ['src/shared/__test__/database.global-setup.ts'],
					setupFiles: ['src/shared/__test__/database.setup.ts'],
					hookTimeout: 120_000,
					testTimeout: 30_000,
				},
			},
		],
	},
});
