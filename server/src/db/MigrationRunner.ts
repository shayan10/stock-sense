import * as path from 'path'
import { promises as fs } from 'fs'
import {
	Kysely,
	Migrator,
	FileMigrationProvider,
  MigrationResult,
  NO_MIGRATIONS,
  MigrationResultSet,
  NoMigrations
} from 'kysely';
import {createConfig} from "./Postgres";

class MigrationRunner {
  private migrator: Migrator;

  constructor(db: Kysely<any>, migrationPath: string) {
    this.migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        // This needs to be an absolute path.
        migrationFolder: migrationPath,
      }),
    })
  }

  private outputMigrationResults(results?: MigrationResult[], error?: unknown) {
    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was executed successfully`)
      } else if (it.status === 'Error') {
        console.error(`failed to execute migration "${it.migrationName}"`)
      }
    })
  
    if (error) {
      console.error('failed to migrate')
      console.error(error)
      process.exit(1)
    }
  }

  private async execute(func: () => Promise<MigrationResultSet>) {
    const {error, results} = await func();
    this.outputMigrationResults(results, error);
  }

  async migrateToLatest() {
    this.execute(() => this.migrator.migrateToLatest());
  }

  async migrateTo(migrationName?: string) {
    const arg: string | NoMigrations = migrationName || NO_MIGRATIONS;
    return this.execute(() => this.migrator.migrateTo(arg));
  }
  
}

const config = createConfig();
const db = new Kysely<any>(config);
export const migrationRunner = new MigrationRunner(db, path.join(__dirname, '../../migrations'));
