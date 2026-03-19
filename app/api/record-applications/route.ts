import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { userId, appliedJobs } = await req.json();

    if (!userId || !appliedJobs || !Array.isArray(appliedJobs)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    for (const job of appliedJobs) {
      if (!job) continue;
      
      const snippet = (job.shortDescription || job.jobDescription || "Naukri Application").replace(/<[^>]+>/g, '').substring(0, 500);

      const [insertedJob] = await db.insert(jobs).values({
        title: job.title || "Unknown Role",
        company: job.companyName || "Unknown Company",
        location: job.location || job.jobLocation || "Remote",
        description: snippet,
        salary: job.salary || "Not Specified",
      }).returning({ id: jobs.id });

      await db.insert(applications).values({
        userId,
        jobId: insertedJob.id,
        status: "applied"
      });
    }

    // Bust the Next.js query cache so the sidebar un-freezes instantly!
    const { revalidatePath } = require("next/cache");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record applications", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
