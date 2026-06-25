import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export function validateObjectId(paramName = "id") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req.params[paramName] as string;

    if (!value || !Types.ObjectId.isValid(value)) {
      next(ApiError.badRequest(`ID invalide: ${paramName}`));
      return;
    }

    next();
  };
}
