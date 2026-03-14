import pg, {
  type Pool as PgPool,
  type PoolClient,
  type QueryResult,
} from 'pg';

import config from '../../config/env.js';
import type {
  DbConnection,
  DbExecutor,
  DbQueryResult,
  DbRow,
} from './types.js';

const { Pool } = pg;

const DEFAULT_POOL_SIZE = 10;

let pool: PgPool | null = null;

const requireDatabaseUrl = (): string => {
  if (config.databaseUrl === null) {
    throw new Error(
      'DATABASE_URL is required before invoking the platform Postgres runtime.',
    );
  }

  return config.databaseUrl;
};

const mapQueryResult = <Row extends DbRow>(
  result: QueryResult<Row>,
): DbQueryResult<Row> => {
  return {
    rowCount: result.rowCount ?? 0,
    rows: result.rows,
  };
};

const queryWithClient = async <Row extends DbRow>(
  client: PgPool | PoolClient,
  text: string,
  values?: readonly unknown[],
): Promise<DbQueryResult<Row>> => {
  if (values === undefined) {
    const result = await client.query<Row>(text);
    return mapQueryResult(result);
  }

  const result = await client.query<Row>(text, [...values]);
  return mapQueryResult(result);
};

const getPoolInternal = (): PgPool => {
  if (pool !== null) {
    return pool;
  }

  pool = new Pool({
    connectionString: requireDatabaseUrl(),
    max: DEFAULT_POOL_SIZE,
  });

  return pool;
};

const createConnection = (client: PoolClient): DbConnection => {
  return {
    query<Row extends DbRow = DbRow>(
      text: string,
      values?: readonly unknown[],
    ): Promise<DbQueryResult<Row>> {
      return queryWithClient<Row>(client, text, values);
    },

    release(): void {
      client.release();
    },

    withTransaction<T>(
      operation: (db: DbConnection) => Promise<T>,
    ): Promise<T> {
      return operation(createConnection(client));
    },
  };
};

const db: DbExecutor = {
  query<Row extends DbRow = DbRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<DbQueryResult<Row>> {
    return queryWithClient<Row>(getPoolInternal(), text, values);
  },

  async connect(): Promise<DbConnection> {
    const client = await getPoolInternal().connect();
    return createConnection(client);
  },

  async withTransaction<T>(
    operation: (db: DbConnection) => Promise<T>,
  ): Promise<T> {
    const client = await getPoolInternal().connect();

    try {
      await client.query('BEGIN');

      const connection = createConnection(client);
      const result = await operation(connection);

      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the original failure. Rollback failure does not change the
        // ownership model or the caller-visible boundary.
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async close(): Promise<void> {
    if (pool === null) {
      return;
    }

    const activePool = pool;
    pool = null;

    await activePool.end();
  },
};

export const getDb = (): DbExecutor => {
  return db;
};
