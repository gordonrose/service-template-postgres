export class HttpError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export const isHttpError = (value: unknown): value is HttpError => {
  return value instanceof HttpError;
};
