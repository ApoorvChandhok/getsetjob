import { auth } from "@/auth";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Building2, MapPin, Search } from "lucide-react";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userApplications = await db
    .select({
      id: applications.id,
      status: applications.status,
      appliedAt: applications.createdAt,
      job: jobs,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, session.user.id))
    .orderBy(desc(applications.createdAt));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Applications</h1>
        <p className="text-neutral-400 mt-2">Track your job application status.</p>
      </div>

      {userApplications.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
          <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No applications yet</h3>
          <p className="text-neutral-500 mt-1">Head over to the jobs board to find opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userApplications.map((app) => (
            <div key={app.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold text-white leading-tight">{app.job.title}</h2>
                <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md border ${
                  app.status === 'applied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  app.status === 'interviewing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  app.status === 'hired' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {app.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-violet-400" />
                  {app.job.company}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {app.job.location}
                </div>
              </div>

              <div className="text-xs text-neutral-500 pt-4 border-t border-white/10 mt-auto">
                Applied on {new Date(app.appliedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
