import assert from "node:assert/strict";
import test from "node:test";

import { createCorsOptions, parseAllowedOrigins } from "@/config/cors";

function getOriginHandler() {
  const originHandler = createCorsOptions(["http://localhost:5173"]).origin;

  if (typeof originHandler !== "function") {
    throw new Error("Expected CORS origin handler to be a function");
  }

  return originHandler;
}

test("parseAllowedOrigins normalizes and deduplicates origins", () => {
  const origins = parseAllowedOrigins(
    " https://shop.example.com/ , https://shop.example.com, http://localhost:5173/ ",
    "http://fallback.localhost:5173",
  );

  assert.deepEqual(origins, ["https://shop.example.com", "http://localhost:5173"]);
});

test("parseAllowedOrigins falls back to APP_URL when CORS_ALLOWED_ORIGINS is absent", () => {
  const origins = parseAllowedOrigins(undefined, "http://localhost:5173/");

  assert.deepEqual(origins, ["http://localhost:5173"]);
});

test("createCorsOptions allows configured browser origins and requests without origin", async () => {
  const originHandler = getOriginHandler();

  await assert.doesNotReject(
    () =>
      new Promise<void>((resolve, reject) => {
        originHandler("http://localhost:5173", (error: Error | null) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  );

  await assert.doesNotReject(
    () =>
      new Promise<void>((resolve, reject) => {
        originHandler(undefined, (error: Error | null) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  );
});

test("createCorsOptions rejects unexpected origins", async () => {
  const originHandler = getOriginHandler();

  await assert.rejects(
    () =>
      new Promise<void>((resolve, reject) => {
        originHandler("https://malicious.example.com", (error: Error | null) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
    /Origin not allowed by CORS/,
  );
});
