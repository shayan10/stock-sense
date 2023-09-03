/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		CREATE TABLE accounts (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) NOT NULL,
			plaid_account_id VARCHAR NOT NULL,
			account_name VARCHAR NOT NULL
		);
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP TABLE accounts;`.execute(db);
}
