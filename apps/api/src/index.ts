import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@clerk/hono";
import type { CloudflareBindings } from "./types";
import chat from "./routes/chat";
import toolkits from "./routes/toolkits";
import connect from "./routes/connect";
import disconnect from "./routes/disconnect";
import agents from "./routes/agents";
import billing from "./routes/billing";

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.basePath("/api")
	.use("*", async (c, next) => {
		return cors({
			origin: c.env.WEB_URL,
			credentials: true,
		})(c, next);
	})
	.use("*", async (c, next) => {
		return clerkMiddleware({
			publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
			secretKey: c.env.CLERK_SECRET_KEY,
		})(c, next);
	})

	.route("/chat", chat)
	.route("/toolkits", toolkits)
	.route("/connect", connect)
	.route("/disconnect", disconnect)
	.route("/agents",agents)
	.route("/billing", billing)

export default app;
export type AppType = typeof app;
