"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { jobs, applications, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function applyToJob(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const jobId = parseInt(formData.get("jobId") as string);
  if (isNaN(jobId)) throw new Error("Invalid job ID");

  // Check if user has already applied
  const existingApp = await db
    .select()
    .from(applications)
    .where(and(eq(applications.userId, session.user.id), eq(applications.jobId, jobId)));

  if (existingApp.length > 0) {
    throw new Error("Already applied to this job");
  }

  // Check user credits and CV
  const [userDb] = await db
    .select({ credits: users.credits, cvUrl: users.cvUrl })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!userDb?.cvUrl) throw new Error("Please upload your CV before applying");
  if (userDb.credits <= 0) throw new Error("Insufficient credits");

  // Transaction: apply and reduce credit
  await db.transaction(async (tx) => {
    // 1. Create Application
    await tx.insert(applications).values({
      jobId,
      userId: session.user.id,
      status: "applied",
    });

    // 2. Reduce credits by 1
    await tx
      .update(users)
      .set({ credits: userDb.credits - 1 })
      .where(eq(users.id, session.user.id));
  });

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/credits"); // Since credits changed
}
