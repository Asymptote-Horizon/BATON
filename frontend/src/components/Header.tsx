"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";
import { 
  UserCheck, 
  RotateCcw, 
  LogOut, 
  Shield, 
  ChevronDown, 
  Check, 
  Sparkles,
  Bot,
  PlusCircle,
  HelpCircle
} from "lucide-react";

const ROLES: { id: UserRole; label: string; name: string; color: string }[] = [
  { id: "admin", label: "Admin", name: "Sarah Chen", color: "bg-purple-900/40 text-purple-300 border-purple-700/60" },
  { id: "leaver", label: "Leaver", name: "Alex Mercer", color: "bg-amber-900/40 text-amber-300 border-amber-700/60" },
  { id: "reviewer", label: "Reviewer", name: "Elena Rostova", color: "bg-blue-900/40 text-blue-300 border-blue-700/60" },
  { id: "successor", label: "Successor", name: "Sam Taylor", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/60" },
  { id: "restricted_viewer", label: "Restricted Viewer", name: "Jordan Lee", color: "bg-slate-800 text-slate-300 border-slate-700" },
];

export function Header({ onOpenNewProject, onOpenHelp }: { onOpenNewProject?: () => void; onOpenHelp?: () => void }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const user = api.getStoredUser();
    if (user) {
      setCurrentUser(user);
    } else {
      api.switchRole("admin").then((u) => setCurrentUser(u)).catch(() => null);
    }
  }, []);

  const handleRoleChange = async (targetRole: UserRole) => {
    try {
      const u = await api.switchRole(targetRole);
      setCurrentUser(u);
      setRoleDropdownOpen(false);
      window.location.reload();
    } catch (err) {
      alert("Failed to switch role");
    }
  };

  const handleResetDemo = async () => {
    if (confirm("Reset Project Aether demonstration dataset to clean original state?")) {
      setResetting(true);
      try {
        await api.resetDemo();
        alert("Project Aether dataset successfully reset!");
        window.location.reload();
      } catch (err: any) {
        alert("Reset failed: " + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  const currentRoleInfo = ROLES.find((r) => r.id === currentUser?.role) || ROLES[0];

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Project Selector & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Workspace</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
          <Bot className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white">Project Aether</span>
            <span className="text-xs text-slate-400 hidden sm:inline">• AMR Navigation & Hardware</span>
          </div>
        </div>

        {/* Create Project Button */}
        {onOpenNewProject && (
          <button
            onClick={onOpenNewProject}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Guided Help Button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            title="What is this page? Guided Explanations"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Guide</span>
          </button>
        )}

        {/* Reset Demo Button */}
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Reset Project Aether to clean initial state"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">{resetting ? "Resetting..." : "Reset"}</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-colors shadow-xs cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Viewing As</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{currentRoleInfo.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${currentRoleInfo.color}`}>
                  {currentRoleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 border-b border-slate-800">
                <div className="text-xs font-bold text-white">Simulate Role Perspective</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inspect permission partitions & canary shields as different team members.
                </p>
              </div>
              <div className="p-1.5 space-y-1">
                {ROLES.map((r) => {
                  const isSelected = r.id === currentUser?.role;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-600/20 font-semibold text-blue-400 border border-blue-500/30" : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.label} Clearance</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${r.color}`}>
                          {r.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User profile & logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
