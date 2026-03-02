import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { HttpError } from "@/utils/httpError";

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (req.user.role !== role) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}
