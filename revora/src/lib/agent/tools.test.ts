import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agentToolNames } from "./tools";

describe("agent tools registry", () => {
  it("exposes exactly the v1 read-only tools", () => {
    assert.deepEqual(agentToolNames(), [
      "getShopStats",
      "searchRecentOrders",
      "getRecentMessages",
    ]);
  });

  // AGENTS.md §1: no content-based regex gates. Every message reaches the LLM,
  // which decides when tools are needed — so there is nothing to assert here
  // about greetings vs sales questions.
});
