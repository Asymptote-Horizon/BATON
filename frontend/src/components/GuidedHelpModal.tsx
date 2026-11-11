"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Layers, 
  Compass, 
  AlertTriangle, 
  Target, 
  Terminal,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";

interface GuidedHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  {
    id: "handover",
    title: "How Project Handover Works",
    icon: FileSpreadsheet,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    summary: "Prevents knowledge from walking out the door when someone leaves.",
    content: "When an engineer, volunteer, or student exits, standard documentation only captures final results. The 'why' behind architectural choices, abandoned alternatives, unwritten workarounds, and crucial contacts vanish. BATON ingests messy sources (chat exports, task boards, meeting transcripts) and reconstructs structured, verified claims with verbatim citations so incoming successors get up to speed in days instead of months."
  },
  {
    id: "claims",
    title: "Claims & Verbatim Quote Grounding",
    icon: Layers,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    summary: "Why every single claim must quote the exact source text.",
    content: "Conventional AI summaries hallucinate plausible details and flatten critical nuance. BATON splits project context into 12 atomic categories (Decisions, Blockers, Ownership, Dependencies, Risks, Contacts, etc.). Every claim must pair with an exact_quote. Our deterministic verifier checks character-by-character against the raw text. If the quote doesn't exist, the claim is demoted to Inferred—never shown as established fact."
  },
  {
    id: "readiness",
    title: "The 0–100 Handover Readiness Score",
    icon: Target,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    summary: "Objective mathematics, not an arbitrary sentiment rating.",
    content: "The Readiness Score is calculated from actual database records across 6 weighted pillars:\n• Evidence Coverage (25%)\n• Ownership Clarity (20%)\n• Conflict Resolution (15%)\n• Dependency Documentation (15%)\n• Access & Runbooks (15%)\n• Human Review (10%)\nSafety Rule: Any active critical blocker immediately forces the project into 'Blocked' or 'At Risk' status, preventing sign-off regardless of point score."
  },
  {
    id: "bus_factor",
    title: "Bus Factor & Knowledge Concentration",
    icon: AlertTriangle,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    summary: "Identifying single points of human failure before they leave.",
    content: "If only one person understands how a deployment works or holds access to hardware calibrations, that component has a Bus Factor of 1. If that person leaves abruptly, the project halts. BATON detects single-person silos and automatically schedules urgent handover missions to cross-train successors."
  },
  {
    id: "canary",
    title: "Role Clearances & Canary Token Defense",
    icon: ShieldCheck,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    summary: "Preventing cross-role leaks and prompt injection attacks.",
    content: "Incoming team members should not see confidential executive salaries or master cloud root keys. BATON enforces 4 sensitivity levels (Public, Internal, Confidential, Restricted). Synthetic canary tokens are monitored during RAG queries to verify that adversarial prompts or jailbreak attempts never leak restricted context to lower-clearance roles."
  }
];

export function GuidedHelpModal({ isOpen, onClose }: GuidedHelpModalProps) {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Platform Guide & Concepts
              </h2>
              <p className="text-xs text-slate-400">
                Understand what each metric means and how BATON solves knowledge loss
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Sidebar + Detail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Topics List */}
          <div className="w-full md:w-72 border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto bg-slate-950/50">
            {TOPICS.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTopic.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/40 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${t.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold block truncate leading-tight">{t.title}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{t.summary}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Topic Detail */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedTopic.color}`}>
                {React.createElement(selectedTopic.icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedTopic.title}</h3>
                <p className="text-xs text-blue-400 font-medium">{selectedTopic.summary}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedTopic.content}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">
                <strong>Why this matters to judges:</strong> This proves the project is built on strict verification principles rather than ungrounded generative AI assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500">BATON Continuity Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

