import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled error:", error);

  const status = typeof error?.status === "number" ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error?.message ?? "Unexpected server error";

  res.status(status).json({
    success: false,
    message,
  });
};
