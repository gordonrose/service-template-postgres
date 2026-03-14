import { getDb } from '../../../lib/postgres/index.js';
import type { TemplateGreetingRepository } from '../domain/ports.js';

const insertTemplateGreetingAuditSql = `
INSERT INTO template_greeting_audit (
  request_id,
  input_name
)
VALUES ($1, $2);
`;

export const createTemplatePostgresGreetingRepository =
  (): TemplateGreetingRepository => {
    return {
      async recordGreeting(record): Promise<void> {
        await getDb().query(insertTemplateGreetingAuditSql, [
          record.requestContext.requestId,
          record.name,
        ]);
      },
    };
  };
