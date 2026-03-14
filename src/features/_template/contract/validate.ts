import type {
  TemplateCreateRequest,
  ValidationResult,
} from './types.js';

export function validateTemplateCreateRequest(
  input: unknown,
): ValidationResult<TemplateCreateRequest> {
  if (typeof input !== 'object' || input === null) {
    return {
      ok: false,
      issues: ['Request body must be an object.'],
    };
  }

  const candidate = input as Record<string, unknown>;
  const issues: string[] = [];

  let normalizedName = '';

  if (typeof candidate.name !== 'string') {
    issues.push('name must be a string.');
  } else if (candidate.name.trim().length === 0) {
    issues.push('name must not be empty.');
  } else {
    normalizedName = candidate.name.trim();
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    value: {
      name: normalizedName,
    },
  };
}
