import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound("Route not found"));
}
