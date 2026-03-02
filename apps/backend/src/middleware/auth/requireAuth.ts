import type { NextFunction, Request, Response } from "express";

import { findOrCreateFromAuth } from "@/services/userService";
import { HttpError } from "@/utils/httpError";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    next(new HttpError(401, "Missing authentication context"));
    return;
  }

  findOrCreateFromAuth(req.auth)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
}
