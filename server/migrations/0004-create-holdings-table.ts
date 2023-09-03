/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		CREATE TABLE holdings (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
			account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
			plaid_account_id VARCHAR NOT NULL,
			ticker_symbol VARCHAR NOT NULL,
			quantity REAL NOT NULL,
			cost_basis REAL NOT NULL
		);
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP TABLE holdings;`.execute(db);
}
