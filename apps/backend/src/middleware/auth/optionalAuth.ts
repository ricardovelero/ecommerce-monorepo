import type { NextFunction, Request, Response } from "express";

import { verifyJwt } from "./verifyJwt";

import { findOrCreateFromAuth } from "@/services/userService";

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.headers.authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  verifyJwt(req, res, (error?: unknown) => {
    if (error) {
      next();
      return;
    }

    if (!req.auth) {
      next();
      return;
    }

    findOrCreateFromAuth(req.auth)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch(() => {
        next();
      });
  });
}
