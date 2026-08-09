import { Router, type IRouter } from "express";
import { isProvider } from "../lib/connection-catalog";
import { UnconfiguredWebhookVerifier } from "../lib/webhook-architecture";

const router: IRouter = Router();
const verifier = new UnconfiguredWebhookVerifier();

router.post("/v1/webhooks/:provider", async (req, res): Promise<void> => {
  const provider = Array.isArray(req.params.provider)
    ? req.params.provider[0]
    : req.params.provider;
  if (!isProvider(provider)) {
    res.status(404).json({ error: "Unknown webhook provider." });
    return;
  }
  const verified = await verifier.verify({
    provider,
    providerEventId: req.header("x-provider-event-id"),
    eventType: req.header("x-provider-event-type") ?? "unknown",
    payload: req.body,
    signature: req.header("x-provider-signature"),
  });
  if (!verified) {
    res.status(501).json({
      error: "Webhook verification is not configured for this provider.",
    });
    return;
  }
  res.status(202).json({ accepted: true });
});

export default router;