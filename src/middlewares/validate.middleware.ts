import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * @example
 * ```ts
 * import { z } from "zod";
 * import { validate } from "../middlewares/validate.middleware.js";
 *
 * const registerSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * router.post("/register", validate(registerSchema), authController.register);
 * ```
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(ApiError.badRequest("Validation échouée", result.error.issues));
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(ApiError.badRequest("Validation échouée", result.error.issues));
      return;
    }

    req.query = result.data as typeof req.query;
    next();
  };
}
