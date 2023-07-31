import * as dotenv from "dotenv";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { sql } from "kysely";
import { Pool } from "pg";

function createPool() {
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

		const db = new Kysely<DB>({
			dialect: new PostgresDialect({
				pool: new Pool({
					host: POSTGRES_HOST,
					port: parseInt(POSTGRES_PORT, 10),
					database: POSTGRES_DB,
					user: POSTGRES_USER,
					password: POSTGRES_PASSWORD,
				}),
			}),
		});

		return db;
	} catch (error) {
		throw error;
	}
}

export const db = createPool();

export async function connect(): Promise<void> {
	try {
		await sql<number>`SELECT 1+1;`.execute(db);
		console.log("Connected to Postgres!");
	} catch (error) {
		throw error;
	}
}
