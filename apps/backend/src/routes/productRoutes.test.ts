import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import test from "node:test";

import express from "express";

import { errorHandler } from "@/middleware/errorHandler";
import { productRoutes } from "@/routes/productRoutes";

test("PUT /products/:id/reviews/me returns 401 for anonymous requests", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", productRoutes);
  app.use(errorHandler);

  const server = http.createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address not available");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/products/product_1/reviews/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 5,
        comment: "Excellent product.",
      }),
    });

    assert.equal(response.status, 401);
  } finally {
    server.close();
    await once(server, "close");
  }
});
