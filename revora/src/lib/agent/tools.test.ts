import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agentToolNames, shouldUseRevenueTools } from "./tools";

describe("agent tools registry", () => {
  it("exposes exactly the v1 read-only tools", () => {
    assert.deepEqual(agentToolNames(), [
      "getShopStats",
      "searchRecentOrders",
      "getRecentMessages",
    ]);
  });

  it("skips revenue tools when message is a greeting", () => {
    assert.equal(shouldUseRevenueTools("hi!!"), false);
    assert.equal(shouldUseRevenueTools("how are sales today?"), true);
  });
});
