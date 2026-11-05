import pg from 'pg';
import { afterAll, beforeAll, beforeEach, inject } from 'vitest';

const DUPLICATE_DATABASE = '42P04';

const templateUrl = new URL(inject('databaseTemplateUrl'));
const templateName = templateUrl.pathname.slice(1);
const workerUrl = new URL(templateUrl);
workerUrl.pathname = `/test_${process.env.VITEST_POOL_ID ?? '1'}`;

process.env.DATABASE_URL = workerUrl.toString();

const pool = new pg.Pool({ connectionString: workerUrl.toString(), max: 1 });

beforeAll(async () => {
	const adminUrl = new URL(templateUrl);
	adminUrl.pathname = '/postgres';
	const admin = new pg.Client({ connectionString: adminUrl.toString() });
	await admin.connect();
	try {
		await admin.query(`CREATE DATABASE "${workerUrl.pathname.slice(1)}" TEMPLATE "${templateName}"`);
	} catch (error) {
		if ((error as { code?: string }).code !== DUPLICATE_DATABASE) {
			throw error;
		}
	} finally {
		await admin.end();
	}
});

beforeEach(async () => {
	const { rows } = await pool.query<{ table: string }>(
		`SELECT format('%I.%I', schemaname, tablename) AS table
		 FROM pg_tables
		 WHERE schemaname NOT IN ('pg_catalog', 'information_schema') AND tablename <> '_prisma_migrations'`,
	);
	if (rows.length > 0) {
		await pool.query(`TRUNCATE ${rows.map((row) => row.table).join(', ')} RESTART IDENTITY CASCADE`);
	}
});

afterAll(async () => {
	await pool.end();
});
