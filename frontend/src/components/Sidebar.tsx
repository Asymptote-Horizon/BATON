"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderGit2,
  FileStack,
  Network,
  Clock,
  Layers,
  SearchCode,
  Compass,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Bot
} from "lucide-react";

const NAV_ITEMS = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    badge: null
  },
  { 
    name: "Handover", 
    href: "/dashboard/handovers", 
    icon: FileSpreadsheet,
    badge: "Core"
  },
  { 
    name: "Projects", 
    href: "/dashboard/projects", 
    icon: FolderGit2,
    badge: null
  },
  { 
    name: "Sources", 
    href: "/dashboard/sources", 
    icon: FileStack,
    badge: null
  },
  { 
    name: "Graph", 
    href: "/dashboard/graph", 
    icon: Network,
    badge: null
  },
  { 
    name: "Timeline", 
    href: "/dashboard/timeline", 
    icon: Clock,
    badge: null
  },
  { 
    name: "Claims", 
    href: "/dashboard/claims", 
    icon: Layers,
    badge: null
  },
  { 
    name: "Evidence", 
    href: "/dashboard/evidence", 
    icon: SearchCode,
    badge: null
  },
  { 
    name: "Decisions", 
    href: "/dashboard/decisions", 
    icon: Compass,
    badge: null
  },
  { 
    name: "Assistant", 
    href: "/dashboard/assistant", 
    icon: Bot,
    badge: "AI"
  },
  { 
    name: "Security", 
    href: "/dashboard/security", 
    icon: ShieldCheck,
    badge: null
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    const stored = api.getStoredUser();
    if (stored) {
      setUser(stored);
    } else {
      api.getMe().then(setUser).catch(() => null);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3.5 bg-slate-900/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-extrabold text-base">
          B
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">BATON</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/25">
              MH12
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-none mt-0.5">Project Continuity</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Main Navigation
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isOverview = item.href === "/dashboard";
          const isActive = isOverview 
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive 
                      ? "bg-blue-700/80 text-blue-100" 
                      : item.badge === "Core" 
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Context & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {user?.full_name || "Active Member"}
              </span>
              <span className="text-[11px] text-slate-400 block truncate capitalize">
                {user?.role ? user.role.replace("_", " ") : "Member"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
