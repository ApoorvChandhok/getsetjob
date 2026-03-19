import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [user] = await db
    .select({ name: users.name, email: users.email, image: users.image, credits: users.credits })
    .from(users)
    .where(eq(users.id, session.user.id));

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar user={user ?? {}} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </SessionProvider>
  );
}
