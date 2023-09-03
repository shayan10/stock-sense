/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
   await sql`
     CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR NOT NULL,
          password VARCHAR NOT NULL, 
          first_name VARCHAR(20) NOT NULL,
          last_name VARCHAR(20) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
     await sql`DROP TABLE users;`.execute(db);
}
