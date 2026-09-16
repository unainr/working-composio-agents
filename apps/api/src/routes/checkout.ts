import { Hono } from "hono";
import { requireUser } from "../middleware/auth";
import { getPolarClient } from "../lib/polar";
import type { CloudflareBindings } from "../types";


import { POLAR_PRO_PRODUCT_ID } from "../lib/utils";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .post("/", async (c) => {
    const userId = c.get("userId");
    const polar = getPolarClient(c.env);

    const checkout = await polar.checkouts.create({
      products: [POLAR_PRO_PRODUCT_ID],
      externalCustomerId: userId,
      successUrl: `${c.env.WEB_URL}/pricing?upgraded=1`,
    });

    return c.json({ checkoutUrl: checkout.url });
  });

export default app;