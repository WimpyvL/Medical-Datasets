export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly expose: boolean;

  constructor(statusCode: number, message: string, expose = true) {
    super(message);
    this.statusCode = statusCode;
    this.expose = expose;
    this.name = 'HttpError';
    Error.captureStackTrace?.(this, HttpError);
  }
}

export function assert(condition: unknown, statusCode: number, message: string): asserts condition {
  if (!condition) {
    throw new HttpError(statusCode, message);
  }
}
