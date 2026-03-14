import { createServer } from 'node:http';
import config from './config/env.js';
import { createApp } from './app.js';

const app = createApp();
const server = createServer(app);

const start = (): void => {
  server.listen(config.port, config.host, () => {
    process.stdout.write(
      `Server listening on http://${config.host}:${config.port}\n`,
    );
  });
};

const shutdown = (signal: string): void => {
  process.stdout.write(`Received ${signal}. Shutting down.\n`);

  server.close((error?: Error) => {
    if (error) {
      process.stderr.write(`Shutdown error: ${error.message}\n`);
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
