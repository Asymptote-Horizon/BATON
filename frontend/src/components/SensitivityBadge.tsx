import React from "react";
import { SensitivityLevel } from "@/lib/types";
import { Globe, Lock, ShieldAlert, KeyRound } from "lucide-react";

export function SensitivityBadge({ level, sensitivity }: { level?: SensitivityLevel; sensitivity?: SensitivityLevel }) {
  const effectiveLevel = level || sensitivity;
  switch (effectiveLevel) {
    case "public":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
          <Globe className="w-3 h-3 text-slate-400" />
          Public
        </span>
      );
    case "internal":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-950/70 text-blue-300 border border-blue-800/60">
          <Lock className="w-3 h-3 text-blue-400" />
          Internal
        </span>
      );
    case "confidential":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
          <KeyRound className="w-3 h-3 text-amber-400" />
          Confidential
        </span>
      );
    case "restricted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-950/70 text-rose-300 border border-rose-800/60">
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          Restricted / Canary
        </span>
      );
    default:
      return null;
  }
}
