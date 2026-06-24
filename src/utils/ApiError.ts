export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown[];

  constructor(statusCode: number, message: string, isOperational = true, details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: unknown[]): ApiError {
    return new ApiError(400, message, true, details);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message: string): ApiError {
    return new ApiError(500, message, false);
  }
}
