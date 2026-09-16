import { pgTable, text, timestamp, integer, decimal, boolean, uuid, jsonb, index, pgEnum } from "drizzle-orm/pg-core";



// -----------=========================
export const composioSessions = pgTable("composio_sessions", {
  // Clerk user ID — stable, use directly as Composio userId
  userId:    text("user_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agents = pgTable("agents", {
  id:          uuid("id").defaultRandom().primaryKey(),
  userId:      text("user_id").notNull(),           // owner (Clerk userId)
  name:        text("name").notNull(),
  description: text("description"),
  avatarUrl:   text("avatar_url"),                  // optional uploaded image URL       
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
   agentId:   uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});






export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  parts: jsonb("parts").notNull(), // store the full UIMessage.parts array (text + tool calls)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// db/schema.ts (add this)
export const userCredits = pgTable("user_credits", {
  userId: text("user_id").primaryKey(),
  credits: integer("credits").notNull().default(40),
  plan: text("plan").notNull().default("free"), // cached snapshot of Clerk's plan
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// db/schema.ts — add these two tables

export const processedWebhookEvents = pgTable("processed_webhook_events", {
  polarEventId: text("polar_event_id").primaryKey(), // the PK itself is the dedupe lock
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "monthly_grant" | "usage"
  amount: integer("amount").notNull(), // positive for grants, negative for spends
  description: text("description"),
  relatedChatId: uuid("related_chat_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});