import { describe, expect, it } from 'vitest';

import type { TemplateEntityRecord } from '../../../src/features/_template/domain/ports.js';
import { executeTemplateCommand } from '../../../src/features/_template/domain/service.js';
import { createTestRequestContext } from '../../helpers/context.js';

describe('_template service', () => {
  it('returns the legacy synchronous response when called without dependencies', () => {
    const result = executeTemplateCommand({
      name: 'Gordon',
    });

    expect(result).toEqual({
      message: 'Template says hello to Gordon.',
    });
  });

  it('returns the persisted response shape and writes through templateEntityRepository when dependencies are supplied', async () => {
    const recorded: TemplateEntityRecord[] = [];
    const requestContext = createTestRequestContext();

    const result = await executeTemplateCommand(
      {
        id: '22222222-2222-4222-8222-222222222222',
        createdAt: '2024-01-01T00:00:00.000Z',
        name: 'Gordon',
      },
      {
        requestContext,
        templateEntityRepository: {
          async create(record): Promise<void> {
            recorded.push(record);
          },
        },
      },
    );

    expect(recorded).toEqual([
      {
        id: '22222222-2222-4222-8222-222222222222',
        requestContext,
        name: 'Gordon',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);

    expect(result).toEqual({
      message: 'Template says hello to Gordon.',
      id: '22222222-2222-4222-8222-222222222222',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });
});
