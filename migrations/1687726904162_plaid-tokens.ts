/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`
		CREATE TABLE plaid_tokens (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id),
			access_token VARCHAR NOT NULL
		);
	`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`DROP TABLE plaid_tokens;`);
}
