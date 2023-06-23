/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
     pgm.sql(`
          CREATE TABLE folders (
               id SERIAL PRIMARY KEY,
               name VARCHAR(200) NOT NULL,
               user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
          );
     `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
     pgm.sql("DROP TABLE folders;")
}
