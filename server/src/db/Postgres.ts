import * as dotenv from "dotenv";
import { Kysely, KyselyConfig, PostgresDialect, SqliteDialect } from "kysely";
import { DB } from "kysely-codegen";
import { sql } from "kysely";
import { Pool } from "pg";
import Database from "better-sqlite3";
import * as path from "path";

export function createConfig(): KyselyConfig {
	dotenv.config();
	const {NODE_ENV} = process.env;
	let config: PostgresDialect | SqliteDialect | undefined;

	if (NODE_ENV == "test") {
		config = new SqliteDialect({
			database: new Database(path.join(__dirname, "../../db.sqlite"))
		})
	} else {
		const {
			POSTGRES_HOST,
			POSTGRES_PORT,
			POSTGRES_DB,
			POSTGRES_USER,
			POSTGRES_PASSWORD,
		} = process.env;

		if (!POSTGRES_PORT || isNaN(parseInt(POSTGRES_PORT))) {
			throw new Error("POSTGRES_PORT invalid");
		}

		config = new PostgresDialect({
			pool: new Pool({
				host: POSTGRES_HOST,
				port: parseInt(POSTGRES_PORT, 10),
				database: POSTGRES_DB,
				user: POSTGRES_USER,
				password: POSTGRES_PASSWORD,
			}),
		})
	}
	return {
		dialect: config
	}
}

function createDB() {
	try {
		const config = createConfig();
		const db = new Kysely<DB>(config);

		return db;
	} catch (error) {
		throw error;
	}
}

export const db = createDB();

export async function connect(): Promise<void> {
	try {
		await sql<number>`SELECT 1+1;`.execute(db);
		console.log("Connected to Postgres!");
	} catch (error) {
		throw error;
	}
}
