import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Briefcase, Coins, ArrowRight } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard/credits");

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">GetSetJob</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Your Career,{" "}
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            One Credit Away
          </span>
        </h1>
        <p className="text-lg text-neutral-400 mb-10 max-w-lg mx-auto">
          Buy credits, upload your CV, and apply to hundreds of jobs across our platform — all in one place.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {[
            { icon: Coins, title: "₹0.5 / credit", desc: "Incredibly affordable job applications" },
            { icon: Briefcase, title: "One profile", desc: "Apply everywhere with a single click" },
            { icon: ArrowRight, title: "Instant credits", desc: "Powered by Razorpay, credits within seconds" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <Icon className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-semibold text-white text-sm">{title}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        {/* Sign In */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard/credits" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200 text-base"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-neutral-600 mt-6">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </main>
  );
}
