import type { QueryResultRow } from 'pg';

export interface DbRow extends QueryResultRow {
  readonly [column: string]: unknown;
}

export interface DbQueryResult<Row extends DbRow = DbRow> {
  readonly rowCount: number;
  readonly rows: readonly Row[];
}

export interface DbSession {
  query<Row extends DbRow = DbRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<DbQueryResult<Row>>;
}

export interface DbConnection extends DbSession {
  release(): void;
  withTransaction<T>(operation: (db: DbConnection) => Promise<T>): Promise<T>;
}

export interface DbExecutor extends DbSession {
  connect(): Promise<DbConnection>;
  withTransaction<T>(operation: (db: DbConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
