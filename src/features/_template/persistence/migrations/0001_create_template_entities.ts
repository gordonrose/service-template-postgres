import type { MigrationDefinition } from '../../../../lib/postgres/index.js';

export const createTemplateEntitiesMigration: MigrationDefinition = {
  id: '0001_create_template_entities',
  up: [
    `
    CREATE TABLE IF NOT EXISTS template_entities (
      template_id text PRIMARY KEY,
      request_id text NOT NULL,
      input_name text NOT NULL,
      created_at timestamptz NOT NULL
    );
    `,
  ],
};
