import { execSync } from 'node:child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
	export interface ProvidedContext {
		databaseTemplateUrl: string;
	}
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
	const container = await new PostgreSqlContainer('postgres:18').withDatabase('app_template').start();
	const databaseTemplateUrl = container.getConnectionUri();

	execSync('npx prisma migrate deploy', {
		env: { ...process.env, DATABASE_URL: databaseTemplateUrl },
		stdio: 'pipe',
	});

	project.provide('databaseTemplateUrl', databaseTemplateUrl);

	return async () => {
		await container.stop();
	};
}
