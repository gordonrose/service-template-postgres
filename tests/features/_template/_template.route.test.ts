import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../../../src/app.js';
import type { DbRow } from '../../../src/lib/postgres/index.js';
import { getDb } from '../../../src/lib/postgres/index.js';
import {
  createHttpTestHarness,
  type HttpTestHarness,
} from '../../harness/httpHarness.js';
import { postJson } from '../../helpers/request.js';

interface ErrorResponse {
  readonly errors: readonly string[];
}

interface TemplateRouteResponse {
  readonly message: string;
  readonly id: string;
  readonly createdAt: string;
}

interface TemplateEntityRow extends DbRow {
  readonly template_id: string;
  readonly request_id: string;
  readonly input_name: string;
  readonly created_at: unknown;
}

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

describe('_template route', () => {
  let harness: HttpTestHarness;

  beforeAll(async () => {
    harness = await createHttpTestHarness(createApp());
  });

  afterAll(async () => {
    await harness.close();
  });

  it('returns 400 for invalid input', async () => {
    const response = await postJson<Record<string, never>, ErrorResponse>(
      harness,
      '/v1/_template',
      {},
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: ['name must be a string.'],
    });
  });

  it('returns 200 with id and createdAt and persists the entity through the real platform route', async () => {
    const response = await postJson<{ name: string }, TemplateRouteResponse>(
      harness,
      '/v1/_template',
      {
        name: 'Gordon',
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type') ?? '').toContain(
      'application/json',
    );
    expect(response.body?.message).toBe('Template says hello to Gordon.');
    expect(response.body?.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(response.body?.id).toMatch(uuidV4Pattern);

    const persisted = await getDb().query<TemplateEntityRow>(
      selectTemplateEntitySql,
      [response.body!.id],
    );

    expect(persisted.rowCount).toBe(1);
    expect(persisted.rows).toHaveLength(1);

    const row = persisted.rows[0]!;

    expect(row.template_id).toBe(response.body!.id);
    expect(row.input_name).toBe('Gordon');
    expect(row.request_id).toMatch(uuidV4Pattern);
    expect(toIsoString(row.created_at)).toBe(response.body!.createdAt);
  });
});
