import { Hono } from "hono";
import { requireUser } from "../middleware/auth";
import { getPolarClient } from "../lib/polar";
import { getDb } from "../db";
import { addCredits } from "../lib/billing";
import { CREDIT_PACKS } from "../lib/utils";
import type { CloudflareBindings } from "../types";

const POLAR_API_BASE = "https://sandbox-api.polar.sh/v1";

interface PolarCheckout {
  id: string;
  status: string;
  product_id: string | null;
  external_customer_id: string | null;
}

async function getPolarCheckout(env: CloudflareBindings, checkoutId: string): Promise<PolarCheckout> {
  const res = await fetch(`${POLAR_API_BASE}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polar API error ${res.status}: ${text}`);
  }

  return res.json();
}

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  // POST /api/checkout — create checkout session
  .post("/", async (c) => {
    const userId = c.get("userId");
    const { productId } = await c.req.json(); // frontend passes which pack
    const polar = getPolarClient(c.env);

    const checkout = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: userId,
      successUrl: `${c.env.WEB_URL}/pricing?checkoutId={CHECKOUT_ID}`,
    });

    return c.json({ checkoutUrl: checkout.url });
  })
  // GET /api/checkout/confirm?checkoutId=xxx
  .get("/confirm", async (c) => {
    const userId = c.get("userId");
    const checkoutId = c.req.query("checkoutId");

    if (!checkoutId) {
      return c.json({ error: "Missing checkoutId" }, 400);
    }

    let checkout: PolarCheckout;
    try {
      checkout = await getPolarCheckout(c.env, checkoutId);
    } catch (err) {
      console.error("[checkout/confirm] failed:", err);
      return c.json({ error: "Failed to fetch checkout" }, 500);
    }

    console.log("[checkout/confirm] status:", checkout.status, "userId:", userId);

    if (checkout.status !== "confirmed" && checkout.status !== "succeeded") {
      return c.json({ error: "Checkout not completed", status: checkout.status }, 400);
    }

    if (checkout.external_customer_id !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const productId = checkout.product_id ?? "";
    const creditsToAdd = CREDIT_PACKS[productId];

    if (!creditsToAdd) {
      console.error("[checkout/confirm] unknown productId:", productId);
      return c.json({ error: "Unknown product" }, 400);
    }

    const db = getDb(c.env);
    const updated = await addCredits(
      db,
      userId,
      creditsToAdd,
      `Purchased ${creditsToAdd} credits`,
    );

    console.log("[checkout/confirm] added", creditsToAdd, "credits to", userId);

    return c.json({ success: true, credits: updated?.credits });
  });

export default app;