import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decideReply, runAgent } from "./runner";

describe("decideReply gating", () => {
  it("stays silent on empty/duplicate", () => {
    assert.equal(decideReply({ text: "", isDuplicate: true }).shouldReply, false);
    assert.equal(decideReply({ text: "hi", isDuplicate: false }).shouldReply, true);
  });

  it("uses canned start without LLM", async () => {
    const res = await runAgent({
      text: "/start",
      llm: async () => ({ text: "SHOULD-NOT-CALL" }),
    });
    assert.equal(res.text.toLowerCase().includes("welcome"), true);
  });

  it("runs one mocked tool round for sales question", async () => {
    const res = await runAgent({
      text: "how are sales today?",
      llm: async () => ({ text: "You have 12 orders totaling $480." }),
    });
    assert.equal(res.shouldReply, true);
    assert.match(res.text, /12 orders/);
  });
});
