import assert from "node:assert/strict";
import test from "node:test";

import { runAfterCommit } from "@/services/postCommit";

test("runAfterCommit triggers the side effect only after the transaction resolves", async () => {
  const events: string[] = [];

  await runAfterCommit(
    async () => {
      events.push("transaction-start");
      events.push("transaction-committed");
      return { orderId: "order_123" };
    },
    async () => {
      events.push("effect-ran");
    },
  );

  assert.deepEqual(events, ["transaction-start", "transaction-committed", "effect-ran"]);
});

test("runAfterCommit skips the side effect when the transaction returns null", async () => {
  let effectCalls = 0;

  await runAfterCommit(
    async () => null,
    async () => {
      effectCalls += 1;
    },
  );

  assert.equal(effectCalls, 0);
});
