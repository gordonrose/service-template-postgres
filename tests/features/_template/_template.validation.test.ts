import { describe, expect, it } from 'vitest';

import { validateTemplateCreateRequest } from '../../../src/features/_template/contract/validate.js';

describe('_template validation', () => {
  it('rejects non-object input', () => {
    const result = validateTemplateCreateRequest('not-an-object');

    expect(result).toEqual({
      ok: false,
      issues: ['Request body must be an object.'],
    });
  });

  it('rejects an empty name', () => {
    const result = validateTemplateCreateRequest({
      name: ' ',
    });

    expect(result).toEqual({
      ok: false,
      issues: ['name must not be empty.'],
    });
  });

  it('accepts valid input and trims the name', () => {
    const result = validateTemplateCreateRequest({
      name: ' Gordon ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Gordon',
      },
    });
  });
});
