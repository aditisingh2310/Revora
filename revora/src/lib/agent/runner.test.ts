import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AGENT_MODEL_ID, KILO_BASE_URL, decideReply, runAgent } from "./runner";

describe("decideReply gating", () => {
  it("stays silent on empty/duplicate", () => {
    assert.equal(decideReply({ text: "", isDuplicate: true }).shouldReply, false);
    assert.equal(decideReply({ text: "hi", isDuplicate: false }).shouldReply, true);
  });

  it("routes /start through the LLM (no canned bypass)", async () => {
    let called = false;
    const res = await runAgent({
      text: "/start",
      llm: async () => {
        called = true;
        return { text: "mocked welcome" };
      },
    });
    assert.equal(called, true);
    assert.equal(res.text, "mocked welcome");
  });

  it("routes greetings through the LLM (no canned bypass)", async () => {
    let called = false;
    const res = await runAgent({
      text: "hi",
      llm: async () => {
        called = true;
        return { text: "mocked greeting" };
      },
    });
    assert.equal(called, true);
    assert.equal(res.shouldReply, true);
    assert.equal(res.text, "mocked greeting");
  });

  it("runs one mocked tool round for sales question", async () => {
    const res = await runAgent({
      text: "how are sales today?",
      llm: async () => ({ text: "You have 12 orders totaling $480." }),
    });
    assert.equal(res.shouldReply, true);
    assert.match(res.text, /12 orders/);
  });

  it("targets Kilo gateway free model by default", () => {
    assert.equal(KILO_BASE_URL, "https://api.kilo.ai/api/gateway");
    assert.match(AGENT_MODEL_ID, /free/);
  });
});
