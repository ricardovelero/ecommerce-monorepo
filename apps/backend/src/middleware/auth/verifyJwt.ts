import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { env } from "@/config/env";
import { HttpError } from "@/utils/httpError";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isEmailLike(value: unknown): value is string {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}

function extractEmail(payload: Record<string, unknown>): string | undefined {
  const directKeys = [
    "email",
    "email_address",
    "primary_email_address",
    "upn",
    "preferred_username",
  ];

  for (const key of directKeys) {
    const value = payload[key];
    if (isEmailLike(value)) {
      return value.trim().toLowerCase();
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (key.toLowerCase().includes("email") && isEmailLike(value)) {
      return value.trim().toLowerCase();
    }
  }

  return undefined;
}

export function verifyJwt(req: Request, _res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  jwtVerify(token, getJwks(), {
    issuer: env.CLERK_ISSUER,
    audience: env.CLERK_AUDIENCE,
  })
    .then(({ payload }) => {
      const externalId = typeof payload.sub === "string" ? payload.sub.trim() : "";
      if (!externalId) {
        throw new HttpError(401, "Invalid token subject");
      }

      req.auth = {
        externalId,
        email: extractEmail(payload),
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
