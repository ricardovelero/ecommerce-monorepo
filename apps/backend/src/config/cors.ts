import type { CorsOptions } from "cors";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

export function parseAllowedOrigins(rawOrigins: string | undefined, appUrl: string): string[] {
  const configuredOrigins = (rawOrigins ?? appUrl)
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  return [...new Set(configuredOrigins)];
}

export function createCorsOptions(allowedOrigins: string[]): CorsOptions {
  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 204,
  };
}
