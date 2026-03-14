import { getDb } from '../db.js';
import type {
  DbConnection,
  DbExecutor,
  DbRow,
} from '../types.js';
import type {
  MigrationDefinition,
  MigrationRunSummary,
} from './types.js';

export interface RunMigrationsOptions {
  readonly db?: DbExecutor;
  readonly migrations: readonly MigrationDefinition[];
}

interface SchemaMigrationRow extends DbRow {
  readonly migration_id: string;
}

const migrationIdPattern = /^\d{4}_[a-z0-9_]+$/;

const createSchemaMigrationsTableSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT NOW()
);
`;

const selectAppliedMigrationsSql = `
SELECT migration_id
FROM schema_migrations
ORDER BY migration_id ASC;
`;

const insertAppliedMigrationSql = `
INSERT INTO schema_migrations (migration_id)
VALUES ($1);
`;

const assertMigrationId = (
  id: string,
  previousId: string | null,
): void => {
  if (!migrationIdPattern.test(id)) {
    throw new Error(
      `Invalid migration id "${id}". Expected zero-padded format "0001_name".`,
    );
  }

  if (previousId !== null && id <= previousId) {
    throw new Error(
      `Migration order is invalid. "${id}" must appear after "${previousId}".`,
    );
  }
};

const assertMigrationDefinition = (
  migration: MigrationDefinition,
  previousId: string | null,
  seenIds: Set<string>,
): void => {
  assertMigrationId(migration.id, previousId);

  if (seenIds.has(migration.id)) {
    throw new Error(`Duplicate migration id "${migration.id}" detected.`);
  }

  if (migration.up.length === 0) {
    throw new Error(
      `Migration "${migration.id}" must contain at least one SQL statement.`,
    );
  }

  for (const statement of migration.up) {
    if (statement.trim().length === 0) {
      throw new Error(
        `Migration "${migration.id}" contains an empty SQL statement.`,
      );
    }
  }

  seenIds.add(migration.id);
};

const assertMigrationList = (
  migrations: readonly MigrationDefinition[],
): void => {
  let previousId: string | null = null;
  const seenIds = new Set<string>();

  for (const migration of migrations) {
    assertMigrationDefinition(migration, previousId, seenIds);
    previousId = migration.id;
  }
};

const ensureSchemaMigrationsTable = async (
  db: DbConnection,
): Promise<void> => {
  await db.query(createSchemaMigrationsTableSql);
};

const readAppliedMigrationIds = async (
  db: DbConnection,
): Promise<Set<string>> => {
  const result = await db.query<SchemaMigrationRow>(selectAppliedMigrationsSql);

  return new Set(result.rows.map((row) => row.migration_id));
};

const applyMigration = async (
  db: DbConnection,
  migration: MigrationDefinition,
): Promise<void> => {
  for (const statement of migration.up) {
    await db.query(statement);
  }

  await db.query(insertAppliedMigrationSql, [migration.id]);
};

export const runMigrations = async (
  options: RunMigrationsOptions,
): Promise<MigrationRunSummary> => {
  assertMigrationList(options.migrations);

  const db = options.db ?? getDb();

  return db.withTransaction(async (connection) => {
    await ensureSchemaMigrationsTable(connection);

    const appliedIds = await readAppliedMigrationIds(connection);
    const appliedMigrationIds: string[] = [];
    const skippedMigrationIds: string[] = [];

    for (const migration of options.migrations) {
      if (appliedIds.has(migration.id)) {
        skippedMigrationIds.push(migration.id);
        continue;
      }

      await applyMigration(connection, migration);
      appliedMigrationIds.push(migration.id);
    }

    return {
      appliedMigrationIds,
      skippedMigrationIds,
    };
  });
};
