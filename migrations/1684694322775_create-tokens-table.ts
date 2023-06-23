/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
     pgm.sql(`
          CREATE TABLE tokens (
               id SERIAL PRIMARY KEY,
               user_id INTEGER REFERENCES users(id) NOT NULL,
               access_token VARCHAR NOT NULL,
               refresh_token VARCHAR NOT NULL,
               access_created_at TIMESTAMP WITH TIME ZONE,
               refresh_created_at TIMESTAMP WITH TIME ZONE
          );
     `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
     pgm.sql("DROP TABLE tokens;")
}
