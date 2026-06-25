declare global {
  namespace Express {
    interface User {
      userId: string;
    }

    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
