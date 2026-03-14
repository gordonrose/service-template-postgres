import { randomUUID } from 'node:crypto';

import pg from 'pg';

const { Client } = pg;

const schemaNamePattern = /^[a-z][a-z0-9_]*$/;

function assertSchemaName(schemaName: string): void {
  if (!schemaNamePattern.test(schemaName)) {
    throw new Error(
      `Invalid test schema name "${schemaName}". Only lowercase letters, numbers, and underscores are allowed, and the name must start with a letter.`,
    );
  }
}

async function withAdminClient<T>(
  databaseUrl: string,
  operation: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString: databaseUrl,
  });

  await client.connect();

  try {
    return await operation(client);
  } finally {
    await client.end();
  }
}

export function requireBaseDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error(
      'DATABASE_URL must point to a reachable Postgres database before `npm run test` executes.',
    );
  }

  return value;
}

export function createIsolatedSchemaName(): string {
  return `test_${randomUUID().replaceAll('-', '_')}`;
}

export function createSchemaScopedDatabaseUrl(
  databaseUrl: string,
  schemaName: string,
): string {
  assertSchemaName(schemaName);

  const url = new URL(databaseUrl);

  url.searchParams.set('options', `-c search_path=${schemaName},public`);

  return url.toString();
}

export async function createIsolatedSchema(
  databaseUrl: string,
  schemaName: string,
): Promise<void> {
  assertSchemaName(schemaName);

  await withAdminClient(databaseUrl, async (client) => {
    await client.query(`CREATE SCHEMA "${schemaName}";`);
  });
}

export async function dropIsolatedSchema(
  databaseUrl: string,
  schemaName: string,
): Promise<void> {
  assertSchemaName(schemaName);

  await withAdminClient(databaseUrl, async (client) => {
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
  });
}

export async function runPlatformMigrations(): Promise<void> {
  const [{ getDb, runMigrations }, { migrationManifest }] = await Promise.all([
    import('../../src/lib/postgres/index.js'),
    import('../../src/lib/postgres/migrations/manifest.js'),
  ]);

  try {
    await runMigrations({
      migrations: migrationManifest,
    });
  } finally {
    await getDb().close();
  }
}

export async function closePlatformDatabase(): Promise<void> {
  const { getDb } = await import('../../src/lib/postgres/index.js');

  await getDb().close();
}
