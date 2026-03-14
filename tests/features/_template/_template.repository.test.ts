import { describe, expect, it } from 'vitest';

import type { DbRow } from '../../../src/lib/postgres/index.js';
import { getDb } from '../../../src/lib/postgres/index.js';
import { createTemplatePostgresEntityRepository } from '../../../src/features/_template/persistence/postgresTemplateEntityRepository.js';
import { createTestRequestContext } from '../../helpers/context.js';

interface SchemaMigrationRow extends DbRow {
  readonly migration_id: string;
}

interface TemplateEntityRow extends DbRow {
  readonly template_id: string;
  readonly request_id: string;
  readonly input_name: string;
  readonly created_at: unknown;
}

const selectAppliedMigrationsSql = `
SELECT migration_id
FROM schema_migrations
ORDER BY migration_id ASC;
`;

const selectTemplateEntitySql = `
SELECT
  template_id,
  request_id,
  input_name,
  created_at
FROM template_entities
WHERE template_id = $1;
`;

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(String(value)).toISOString();
}

describe('_template repository', () => {
  it('applies the platform migration manifest into the isolated schema before repository tests run', async () => {
    const result = await getDb().query<SchemaMigrationRow>(
      selectAppliedMigrationsSql,
    );

    expect(result.rows.map((row) => row.migration_id)).toEqual([
      '0001_create_template_entities',
    ]);
  });

  it('persists a template entity through the real Postgres repository', async () => {
    const repository = createTemplatePostgresEntityRepository();
    const requestContext = createTestRequestContext();

    await repository.create({
      id: '11111111-1111-4111-8111-111111111111',
      requestContext,
      name: 'Gordon',
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    const result = await getDb().query<TemplateEntityRow>(
      selectTemplateEntitySql,
      ['11111111-1111-4111-8111-111111111111'],
    );

    expect(result.rowCount).toBe(1);
    expect(result.rows).toHaveLength(1);

    const persisted = result.rows[0]!;

    expect(persisted.template_id).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(persisted.request_id).toBe(requestContext.requestId);
    expect(persisted.input_name).toBe('Gordon');
    expect(toIsoString(persisted.created_at)).toBe(
      '2024-01-01T00:00:00.000Z',
    );
  });
});
