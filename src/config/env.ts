export type NodeEnv = 'development' | 'test' | 'production';

export interface AppConfig {
  readonly host: string;
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly databaseUrl: string | null;
}

const allowedNodeEnvironments = new Set<NodeEnv>([
  'development',
  'test',
  'production',
]);

const readNodeEnv = (): NodeEnv => {
  const value = process.env.NODE_ENV ?? 'development';

  if (!allowedNodeEnvironments.has(value as NodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${value}". Expected one of: development, test, production.`,
    );
  }

  return value as NodeEnv;
};

const readHost = (): string => {
  const value = process.env.HOST ?? '0.0.0.0';

  if (value.trim().length === 0) {
    throw new Error('HOST must not be empty.');
  }

  return value;
};

const readPort = (): number => {
  const raw = process.env.PORT ?? '3000';
  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(
      `Invalid PORT "${raw}". Expected an integer between 1 and 65535.`,
    );
  }

  return parsed;
};

const readDatabaseUrl = (): string | null => {
  const raw = process.env.DATABASE_URL;

  if (raw === undefined) {
    return null;
  }

  const value = raw.trim();

  if (value.length === 0) {
    throw new Error('DATABASE_URL must not be empty when provided.');
  }

  return value;
};

const config: AppConfig = Object.freeze({
  host: readHost(),
  nodeEnv: readNodeEnv(),
  port: readPort(),
  databaseUrl: readDatabaseUrl(),
});

export default config;
