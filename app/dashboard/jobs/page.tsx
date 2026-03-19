import { auth } from "@/auth";
import { db } from "@/db";
import { jobs, applications, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Briefcase, Building2, MapPin, IndianRupee, LayoutTemplate } from "lucide-react";
import { applyToJob } from "./actions";

export default async function JobsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all jobs
  const allJobs = await db.select().from(jobs).orderBy(jobs.createdAt);
  
  // Fetch user's applications
  const userApplications = await db
    .select({ jobId: applications.jobId })
    .from(applications)
    .where(eq(applications.userId, session.user.id));
    
  // Fetch current user credits
  const [userDb] = await db
    .select({ credits: users.credits, cvUrl: users.cvUrl })
    .from(users)
    .where(eq(users.id, session.user.id));

  const appliedJobIds = new Set(userApplications.map((a) => a.jobId));
  const hasCv = !!userDb?.cvUrl;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Available Jobs</h1>
        <p className="text-neutral-400 mt-2">Find your next opportunity. Applying costs 1 credit.</p>
      </div>

      {!hasCv && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-200 text-sm flex items-center gap-3">
          <LayoutTemplate className="w-5 h-5 text-orange-400" />
          <span>You need to upload your CV in your profile before you can apply to jobs.</span>
        </div>
      )}

      {allJobs.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
          <Briefcase className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No jobs available yet</h3>
          <p className="text-neutral-500 mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            const canApply = hasCv && !isApplied && userDb.credits > 0;

            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-white leading-tight">{job.title}</h2>
                    {isApplied && (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs font-semibold uppercase tracking-wider">
                        Applied
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-violet-400" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                        {job.salary}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-neutral-300 line-clamp-3 mb-6 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    {job.description}
                  </p>
                </div>

                <form action={applyToJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button
                    type="submit"
                    disabled={!canApply}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isApplied
                        ? "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5"
                        : !hasCv
                        ? "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/10"
                        : userDb.credits <= 0
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                    }`}
                  >
                    {isApplied
                      ? "Already Applied"
                      : !hasCv
                      ? "Upload CV to Apply"
                      : userDb.credits <= 0
                      ? "Insufficient Credits"
                      : "Apply Now (-1 Credit)"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
