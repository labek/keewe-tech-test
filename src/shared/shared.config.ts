function required(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is required (see .env.example).`);
	}

	return value;
}

export const sharedConfig = {
	databaseUrl: required('DATABASE_URL'),
};
