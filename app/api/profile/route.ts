import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, cvUrl } = await req.json();
  const updates: { name?: string; cvUrl?: string } = {};

  if (name !== undefined) updates.name = name;
  if (cvUrl !== undefined) updates.cvUrl = cvUrl;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, session.user.id));
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({ name: users.name, email: users.email, credits: users.credits, cvUrl: users.cvUrl, image: users.image })
    .from(users)
    .where(eq(users.id, session.user.id));

  return NextResponse.json(user);
}
