"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Briefcase, Coins, UserCircle, LogOut, CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: CheckCircle2 },
  { href: "/dashboard/credits", label: "Credits", icon: Coins },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null; image?: string | null; credits?: number } }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-sm flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Briefcase className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">GetSetJob</span>
      </div>

      {/* User Info */}
      <div className="p-4 mx-3 mt-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-inner">
        {user.image && (
          <img src={user.image} referrerPolicy="no-referrer" alt="avatar" className="w-10 h-10 rounded-full mb-3 ring-2 ring-violet-500/30" />
        )}
        <div className="text-sm font-semibold text-white truncate">{user.name ?? "User"}</div>
        <div className="text-xs text-neutral-400 truncate mb-3">{user.email}</div>
        <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-md bg-violet-500/10 border border-violet-500/20 w-max">
          <Coins className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 shadow-sm">{user.credits ?? 0} credits</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-violet-300 border border-violet-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-violet-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
