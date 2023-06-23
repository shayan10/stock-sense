/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
     CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR NOT NULL,
          password VARCHAR NOT NULL, 
          first_name VARCHAR(20) NOT NULL,
          last_name VARCHAR(20) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql('DROP TABLE users');
}
