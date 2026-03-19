import { db } from "../../db/index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Giving all users with 0 credits a free 20 credits...");
  await db.update(users).set({ credits: 20 }).where(eq(users.credits, 0));
  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);
