import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId, creditsToDeduct } = await req.json();

    if (!userId || !creditsToDeduct) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits < creditsToDeduct) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    // Deduct credits
    await db
      .update(users)
      .set({ credits: user.credits - creditsToDeduct })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to deduct credits", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
