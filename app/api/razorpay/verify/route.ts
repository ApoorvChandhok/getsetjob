import { auth } from "@/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Find the order and get credits
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.razorpayOrderId, razorpay_order_id));

  if (!order || order.userId !== session.user?.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Extract userId before the transaction to help TypeScript narrow the type
  const userId = session.user.id!;

  // Update order status and increment user credits atomically
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(orders.razorpayOrderId, razorpay_order_id));

    await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${order.credits}` })
      .where(eq(users.id, userId));
  });

  return NextResponse.json({ success: true, creditsAdded: order.credits });
}
