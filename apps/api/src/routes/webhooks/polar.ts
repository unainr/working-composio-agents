import { Hono } from "hono";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getDb } from "../../db";
import { processedWebhookEvents } from "../../db/schema";
import { grantPlanCredits } from "../../lib/billing";
import type { CloudflareBindings } from "../../types";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .post("/", async (c) => {
    const body = await c.req.text();
    const headers = Object.fromEntries(c.req.raw.headers.entries());

    let event;
    try {
      event = validateEvent(body, headers, c.env.POLAR_WEBHOOK_SECRET);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return c.json({ error: "Invalid signature" }, 403);
      }
      throw err;
    }

    const db = getDb(c.env);

    const inserted = await db
      .insert(processedWebhookEvents)
      .values({ polarEventId: event.data.id, eventType: event.type })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) {
      return c.json({ received: true, deduped: true });
    }

    console.log("[polar webhook]", event.type);

    const userId = (event.data as any).customer?.externalId;

    if (event.type === "order.paid") {
      if (userId) await grantPlanCredits(db, userId, "pro");
    }

    if (event.type === "subscription.active") {
      if (userId) await grantPlanCredits(db, userId, "pro");
    }

  

    if (event.type === "subscription.revoked" || event.type === "subscription.canceled") {
      if (userId) await grantPlanCredits(db, userId, "free");
    }

    return c.json({ received: true });
  });

export default app;