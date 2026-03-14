import type { HttpTestHarness } from '../harness/httpHarness.js';

export interface JsonResponse<T> {
  readonly status: number;
  readonly headers: Headers;
  readonly body: T | null;
}

function mergeHeaders(
  baseHeaders: Record<string, string>,
  extraHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(baseHeaders);

  if (extraHeaders !== undefined) {
    new Headers(extraHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export async function requestJson<TResponse>(
  harness: HttpTestHarness,
  path: string,
  init: RequestInit = {},
): Promise<JsonResponse<TResponse>> {
  const headers = mergeHeaders(
    {
      accept: 'application/json',
    },
    init.headers,
  );

  const response = await harness.request(path, {
    ...init,
    headers,
  });

  const rawBody = await response.text();

  return {
    status: response.status,
    headers: response.headers,
    body: rawBody.length === 0 ? null : (JSON.parse(rawBody) as TResponse),
  };
}

export async function postJson<TRequest, TResponse>(
  harness: HttpTestHarness,
  path: string,
  body: TRequest,
  init: Omit<RequestInit, 'method' | 'body'> = {},
): Promise<JsonResponse<TResponse>> {
  const headers = mergeHeaders(
    {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    init.headers,
  );

  return requestJson<TResponse>(harness, path, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
