import type { Request, Response, NextFunction } from "express";
import { vorldAuth } from "@services/vorldAuth.js";
import { StatusCodes } from "http-status-codes";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: How to authenticate user account
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Missing authentication credentials",
        code: "MISSING_CREDENTIALS",
      });
    }

    const result = await vorldAuth.verifyToken(token);

    if (!result.success || !result.valid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
    }

    req.user = result.user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(String(req.user.role ?? ""))) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

export const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }

    const now = Date.now();
    const timestamps = requests.get(userId) ?? [];
    const filtered = timestamps.filter((time) => now - time < windowMs);

    if (filtered.length >= maxRequests) {
      return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        message: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
      });
    }

    filtered.push(now);
    requests.set(userId, filtered);
    next();
  };
};
