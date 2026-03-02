import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { env } from "@/config/env";
import { HttpError } from "@/utils/httpError";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }

  const token = header.replace("Bearer ", "").trim();
  if (!token) {
    throw new HttpError(401, "Missing bearer token");
  }

  return token;
}

function getJwks() {
  if (!env.CLERK_JWKS_URL || !env.CLERK_ISSUER) {
    throw new HttpError(500, "Auth verification is not configured");
  }

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(env.CLERK_JWKS_URL));
  }

  return jwks;
}

export function verifyJwt(req: Request, _res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  jwtVerify(token, getJwks(), {
    issuer: env.CLERK_ISSUER,
  })
    .then(({ payload }) => {
      const externalId = payload.sub;
      if (typeof externalId !== "string" || !externalId) {
        throw new HttpError(401, "Invalid token subject");
      }

      req.auth = {
        externalId,
        email: typeof payload.email === "string" ? payload.email : undefined,
      };

      next();
    })
    .catch((error) => {
      if (error instanceof HttpError) {
        next(error);
        return;
      }

      next(new HttpError(401, "Invalid or expired token"));
    });
}
