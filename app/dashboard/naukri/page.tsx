import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function NaukriScraperPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [userDb] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, session.user.id));

  const credits = userDb?.credits ?? 0;

  return (
    <div className="flex-1 w-full h-[calc(100vh-2rem)] rounded-xl overflow-hidden border border-white/10 shadow-xl bg-white/5">
      <iframe
        src={`http://localhost:5001/?userId=${session.user.id}&credits=${credits}`}
        className="w-full h-full border-0"
        title="Naukri Scraper Bot"
      />
    </div>
  );
}
