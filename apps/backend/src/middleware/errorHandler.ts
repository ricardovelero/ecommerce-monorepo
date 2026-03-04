import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "@/lib/logger";
import { HttpError } from "@/utils/httpError";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void next;
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      issues: error.flatten(),
      requestId: req.requestId,
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      requestId: req.requestId,
    });
    return;
  }

  logger.error({ err: error, requestId: req.requestId }, "Unhandled error");
  res.status(500).json({
    message: "Internal server error",
    requestId: req.requestId,
  });
}
