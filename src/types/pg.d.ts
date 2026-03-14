declare module 'pg' {
  export interface QueryResultRow {
    readonly [column: string]: unknown;
  }

  export interface QueryResult<Row extends QueryResultRow = QueryResultRow> {
    readonly rowCount: number | null;
    readonly rows: Row[];
  }

  export interface PoolClient {
    query<Row extends QueryResultRow = QueryResultRow>(
      text: string,
      values?: unknown[],
    ): Promise<QueryResult<Row>>;
    release(): void;
  }

  export class Pool {
    constructor(config?: { connectionString?: string; max?: number });
    query<Row extends QueryResultRow = QueryResultRow>(
      text: string,
      values?: unknown[],
    ): Promise<QueryResult<Row>>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export class Client {
    constructor(config?: { connectionString?: string });
    connect(): Promise<void>;
    query<Row extends QueryResultRow = QueryResultRow>(
      text: string,
      values?: unknown[],
    ): Promise<QueryResult<Row>>;
    end(): Promise<void>;
  }

  const pg: {
    Pool: typeof Pool;
    Client: typeof Client;
  };

  export default pg;
}
