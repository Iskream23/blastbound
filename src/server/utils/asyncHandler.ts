import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <T extends RequestHandler>(handler: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
