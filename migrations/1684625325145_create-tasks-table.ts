/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
     pgm.sql(`
          CREATE TABLE tasks (
               id SERIAL PRIMARY KEY,
               content VARCHAR NOT NULL,
               deadline TIMESTAMP WITH TIME ZONE,
               user_id INTEGER REFERENCES users(id) NOT NULL,
               folder_id INTEGER REFERENCES folders(id),
               completed BOOLEAN DEFAULT FALSE
          );
     `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
     pgm.sql(`DROP TABLE tasks;`)
}
