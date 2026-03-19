import { db } from "../../db/index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Fixing default credits for users table...");
  
  // Alter table directly so Drizzle push doesn't get ignored on defaults.
  await db.execute(sql`ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 20;`);
  
  // Retroactive fix
  await db.execute(sql`UPDATE "user" SET "credits" = 20 WHERE "credits" = 0;`);
  
  console.log("Fixed! All users correctly updated to 20 free credits.");
  process.exit(0);
}

main().catch(console.error);
