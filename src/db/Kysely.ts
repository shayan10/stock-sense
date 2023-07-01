import * as dotenv from "dotenv";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { Pool } from "pg";

export async function connect() {
	dotenv.config();
	const {
		POSTGRES_HOST,
		POSTGRES_PORT,
		POSTGRES_DB,
		POSTGRES_USER,
		POSTGRES_PASSWORD,
	} = process.env;

	try {
		if (!POSTGRES_PORT || isNaN(parseInt(POSTGRES_PORT))) {
			throw new Error("POSTGRES_PORT invalid");
		}

		const db = await new Kysely<DB>({
			dialect: new PostgresDialect({
				pool: async () =>
					new Pool({
						host: POSTGRES_HOST,
						port: parseInt(POSTGRES_PORT, 10),
						database: POSTGRES_DB,
						user: POSTGRES_USER,
						password: POSTGRES_PASSWORD,
					}),
			}),
		});

		console.log("Connected to Postgres!");

		return db;
	} catch (error) {
		throw error;
	}
}
