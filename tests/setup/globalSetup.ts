import {
  closePlatformDatabase,
  createIsolatedSchema,
  createIsolatedSchemaName,
  createSchemaScopedDatabaseUrl,
  dropIsolatedSchema,
  requireBaseDatabaseUrl,
  runPlatformMigrations,
} from './postgres.js';

export default async function globalSetup(): Promise<() => Promise<void>> {
  const baseDatabaseUrl = requireBaseDatabaseUrl();
  const schemaName = createIsolatedSchemaName();
  const isolatedDatabaseUrl = createSchemaScopedDatabaseUrl(
    baseDatabaseUrl,
    schemaName,
  );

  await createIsolatedSchema(baseDatabaseUrl, schemaName);

  process.env.TEST_DATABASE_ADMIN_URL = baseDatabaseUrl;
  process.env.TEST_DATABASE_SCHEMA = schemaName;
  process.env.DATABASE_URL = isolatedDatabaseUrl;

  await runPlatformMigrations();

  return async (): Promise<void> => {
    await closePlatformDatabase();
    await dropIsolatedSchema(baseDatabaseUrl, schemaName);

    process.env.DATABASE_URL = baseDatabaseUrl;
    delete process.env.TEST_DATABASE_ADMIN_URL;
    delete process.env.TEST_DATABASE_SCHEMA;
  };
}
