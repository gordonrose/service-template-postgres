import { afterEach, beforeEach, vi } from 'vitest';

const FIXED_SYSTEM_TIME = new Date('2024-01-01T00:00:00.000Z');

process.env.NODE_ENV = 'test';

beforeEach(() => {
  vi.useFakeTimers({
    now: FIXED_SYSTEM_TIME,
    toFake: ['Date'],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
