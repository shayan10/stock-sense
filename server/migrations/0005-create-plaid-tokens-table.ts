/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		CREATE TABLE plaid_tokens (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id),
			access_token VARCHAR NOT NULL
		);
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP TABLE plaid_tokens;`.execute(db);
}
