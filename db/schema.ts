import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  credits: integer("credits").notNull().default(20),
  cvUrl: text("cvUrl"),
  role: text("role").default("candidate"), // "candidate" or "employer"
});

// ── Accounts (OAuth) ─────────────────────────────────────────────────────────
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

// ── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ── Verification Tokens ───────────────────────────────────────────────────────
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

// ── Orders ───────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", ["created", "paid", "failed"]);

export const orders = pgTable("order", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpayOrderId").notNull().unique(),
  credits: integer("credits").notNull(),
  amountInPaise: integer("amountInPaise").notNull(),
  status: orderStatusEnum("status").notNull().default("created"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const jobs = pgTable("job", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  salary: text("salary"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// ── Applications ─────────────────────────────────────────────────────────────
export const applications = pgTable("application", {
  id: serial("id").primaryKey(),
  jobId: integer("jobId").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("applied"), // "applied", "interviewing", "rejected", "hired"
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
