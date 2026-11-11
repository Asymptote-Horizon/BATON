import React from "react";
import { ClaimStatus } from "@/lib/types";
import { ShieldCheck, FileCheck, HelpCircle, AlertTriangle, HelpCircle as MissingIcon, AlertCircle } from "lucide-react";

export function StatusBadge({ status }: { status: ClaimStatus }) {
  switch (status) {
    case "Verified":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Verified
        </span>
      );
    case "Evidence-backed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/60">
          <FileCheck className="w-3.5 h-3.5 text-blue-400" />
          Evidence-backed
        </span>
      );
    case "Inferred":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          Inferred
        </span>
      );
    case "Conflict":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/60">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          Conflict
        </span>
      );
    case "Missing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/60">
          <MissingIcon className="w-3.5 h-3.5 text-purple-400" />
          Missing Gap
        </span>
      );
    case "Unverified":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          Unverified
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800/80 text-slate-300 border border-slate-700">
          {status}
        </span>
      );
  }
}
