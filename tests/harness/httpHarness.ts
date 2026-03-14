import {
  createServer,
  type RequestListener,
  type Server,
} from 'node:http';
import type { AddressInfo } from 'node:net';

export interface HttpTestHarness {
  readonly baseUrl: string;
  request(path: string, init?: RequestInit): Promise<Response>;
  close(): Promise<void>;
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function createHttpTestHarness(
  handler: RequestListener,
): Promise<HttpTestHarness> {
  const server = createServer(handler);

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('error', onError);
      reject(error);
    };

    server.on('error', onError);

    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError);
      resolve();
    });
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    await closeServer(server);
    throw new Error('HTTP test harness failed to resolve a numeric port.');
  }

  const { port } = address as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    request(path, init) {
      const url = new URL(path, baseUrl);

      return fetch(url, init);
    },
    close() {
      return closeServer(server);
    },
  };
}

export async function withHttpTestHarness<T>(
  handler: RequestListener,
  run: (harness: HttpTestHarness) => Promise<T>,
): Promise<T> {
  const harness = await createHttpTestHarness(handler);

  try {
    return await run(harness);
  } finally {
    await harness.close();
  }
}
