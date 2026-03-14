import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  readonly requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(
  context: RequestContext,
  callback: () => T,
): T => {
  return requestContextStorage.run(context, callback);
};

export const getRequestContext = (): RequestContext => {
  const context = requestContextStorage.getStore();

  if (!context) {
    throw new Error(
      'RequestContext is unavailable outside the platform request boundary.',
    );
  }

  return context;
};

export const getOptionalRequestContext = (): RequestContext | null => {
  return requestContextStorage.getStore() ?? null;
};
