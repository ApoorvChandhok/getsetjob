"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const cvUrl = formData.get("cvUrl") as string;

  await db
    .update(users)
    .set({
      name: name || session.user.name, // fallback
      cvUrl: cvUrl || null,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard/profile");
}
