import { Response } from "express";

export function sendSuccess(res: Response, statusCode: number, message: string, data?: unknown): void {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
}
