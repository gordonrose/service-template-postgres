import type { RequestContext } from '../../src/lib/requestContext.js';

let requestCounter = 0;

function formatCounter(value: number): string {
  return value.toString().padStart(12, '0');
}

export function createTestRequestContext(): RequestContext {
  requestCounter += 1;

  return Object.freeze({
    requestId: `00000000-0000-4000-8000-${formatCounter(requestCounter)}`,
  });
}
