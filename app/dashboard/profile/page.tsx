import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { UserCircle, Link as LinkIcon, Briefcase } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [userDb] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Profile</h1>
        <p className="text-neutral-400 mt-2">Manage your personal information and CV.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm sm:p-8">
        <div className="flex items-center gap-6 mb-8">
          {userDb?.image ? (
            <img src={userDb.image} referrerPolicy="no-referrer" alt="Profile Picture" className="w-20 h-20 rounded-full border-2 border-violet-500/30 object-cover shadow-lg shadow-violet-500/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center border-2 border-violet-500/30 shadow-inner">
              <UserCircle className="w-10 h-10 text-violet-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{userDb?.name ?? "Getting your name..."}</h2>
            <p className="text-neutral-400">{userDb?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Role: {userDb?.role ?? "Candidate"}
            </span>
          </div>
        </div>

        <form action={updateProfile} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-neutral-300">Display Name</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={userDb?.name || ""}
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
              placeholder="E.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cvUrl" className="text-sm font-medium text-neutral-300">CV Link (Google Drive, Notion, etc.)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="url"
                id="cvUrl"
                name="cvUrl"
                defaultValue={userDb?.cvUrl || ""}
                placeholder="https://yourexternal-cv-link.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Provide a public link to your resume. Required before applying to jobs.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
