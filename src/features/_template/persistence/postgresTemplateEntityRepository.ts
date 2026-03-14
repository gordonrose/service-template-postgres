import { getDb } from '../../../lib/postgres/index.js';
import type { TemplateEntityRepository } from '../domain/ports.js';

const insertTemplateEntitySql = `
INSERT INTO template_entities (
  template_id,
  request_id,
  input_name,
  created_at
)
VALUES ($1, $2, $3, $4);
`;

export const createTemplatePostgresEntityRepository =
  (): TemplateEntityRepository => {
    return {
      async create(record): Promise<void> {
        await getDb().query(insertTemplateEntitySql, [
          record.id,
          record.requestContext.requestId,
          record.name,
          record.createdAt,
        ]);
      },
    };
  };
