import "express";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
    }

    interface Request {
      user?: User | undefined;
    }
  }
}