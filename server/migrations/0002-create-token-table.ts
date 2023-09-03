/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
     await sql`
          CREATE TABLE tokens (
               id SERIAL PRIMARY KEY,
               user_id INTEGER REFERENCES users(id) NOT NULL,
               access_token VARCHAR NOT NULL,
               refresh_token VARCHAR NOT NULL,
               access_created_at TIMESTAMP WITH TIME ZONE,
               refresh_created_at TIMESTAMP WITH TIME ZONE
          );
     `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
     await sql`DROP TABLE tokens;`.execute(db);
}
