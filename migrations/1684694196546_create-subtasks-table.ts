/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
     pgm.sql(`
          CREATE TABLE subtasks (
               id SERIAL PRIMARY KEY,
               content VARCHAR(500) NOT NULL,
               user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
               task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
               completed BOOLEAN DEFAULT FALSE
          );
     `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
     pgm.sql("DROP TABLE subtasks");
}
