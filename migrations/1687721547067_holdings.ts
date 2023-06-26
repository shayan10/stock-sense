/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`
		CREATE TABLE holdings (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) NOT NULL,
			account_id INTEGER REFERENCES accounts(id) NOT NULL,
			ticker_symbol VARCHAR NOT NULL,
			quantity DECIMAL (20, 8) NOT NULL,
			cost_basis DECIMAL (20, 8) NOT NULL
		);
	`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`DROP TABLE holdings;`);
}
