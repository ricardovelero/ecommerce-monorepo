import type { NextFunction, Request, Response } from "express";

import { HttpError } from "@/utils/httpError";

function isJwtLike(value: string): boolean {
  return value.split(".").length === 3;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }

  const token = header.replace("Bearer ", "").trim();
  if (!isJwtLike(token)) {
    throw new HttpError(401, "Invalid token format");
  }

  req.auth = {
    // TODO: replace with provider SDK validation and real user id extraction.
    userId: "jwt-user",
    token,
  };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = header.replace("Bearer ", "").trim();
  if (!isJwtLike(token)) {
    next();
    return;
  }

  req.auth = {
    userId: "jwt-user",
    token,
  };
  next();
}
