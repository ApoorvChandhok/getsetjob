import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db";
import { orders } from "@/db/schema";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { credits } = await req.json();
  if (!credits || credits < 1) {
    return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
  }

  const amountInPaise = Math.round(credits * 0.5 * 100); // 1 credit = ₹0.5

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  });

  await db.insert(orders).values({
    userId: session.user.id,
    razorpayOrderId: razorpayOrder.id,
    credits,
    amountInPaise,
    status: "created",
  });

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    credits,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
