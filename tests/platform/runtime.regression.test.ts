import type { RequestListener } from 'node:http';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import * as appModule from '../../src/app.js';
import {
  createHttpTestHarness,
  type HttpTestHarness,
} from '../harness/httpHarness.js';
import { requestJson } from '../helpers/request.js';

function resolvePlatformRequestHandler(): RequestListener {
  const moduleRecord = appModule as Record<string, unknown>;

  const directCandidates: unknown[] = [
    moduleRecord.app,
    moduleRecord.default,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'function') {
      return candidate as RequestListener;
    }
  }

  const createApp = moduleRecord.createApp;

  if (typeof createApp === 'function') {
    const created = (createApp as () => unknown)();

    if (typeof created === 'function') {
      return created as RequestListener;
    }
  }

  throw new Error(
    'src/app.ts must expose an importable request handler through `app`, the default export, or `createApp()`.',
  );
}

describe('platform runtime regression suite', () => {
  let harness: HttpTestHarness;

  beforeAll(async () => {
    const requestHandler = resolvePlatformRequestHandler();
    harness = await createHttpTestHarness(requestHandler);
  });

  afterAll(async () => {
    await harness.close();
  });

  it('serves GET /health as JSON with a stable payload', async () => {
    const first = await requestJson<Record<string, unknown>>(
      harness,
      '/health',
    );

    const second = await requestJson<Record<string, unknown>>(
      harness,
      '/health',
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    expect(first.headers.get('content-type') ?? '').toContain(
      'application/json',
    );
    expect(second.headers.get('content-type') ?? '').toContain(
      'application/json',
    );

    expect(first.body).not.toBeNull();
    expect(second.body).not.toBeNull();
    expect(first.body).toEqual(second.body);

    expect(first.body).toHaveProperty('status');
  });

  it('keeps GET /health deterministic when query parameters are present', async () => {
    const baseline = await requestJson<Record<string, unknown>>(
      harness,
      '/health',
    );

    const withQuery = await requestJson<Record<string, unknown>>(
      harness,
      '/health?probe=1',
    );

    expect(baseline.status).toBe(200);
    expect(withQuery.status).toBe(200);
    expect(withQuery.body).toEqual(baseline.body);
  });

  it('serves GET /metrics with a text response body', async () => {
    const response = await harness.request('/metrics');
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type') ?? '').toContain(
      'text/plain',
    );
    expect(body.length).toBeGreaterThan(0);
  });

  it('returns 404 for undeclared platform routes', async () => {
    const response = await harness.request('/this-route-does-not-exist');

    expect(response.status).toBe(404);
  });
});
