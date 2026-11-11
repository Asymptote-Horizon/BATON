"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Lock, 
  SearchCode, 
  Award, 
  FileStack, 
  Bot, 
  HelpCircle,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Zap,
  FolderGit2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting & grid mesh */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`, backgroundSize: '32px 32px' }} 
        />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">BATON</span>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Round 2 Build
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Project Continuity Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold shadow-inner">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>Prevent Critical Knowledge From Leaving With People</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Pass the project, <br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            not just the files.
          </span>
        </h1>

        <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          When key team members leave, documents record final outcomes—but the real reasoning, 
          unwritten workarounds, and crucial contacts walk out the door.
        </p>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-normal">
          BATON ingests messy project chats, task boards, meeting notes, and repos to reconstruct verified, 
          role-partitioned handovers where <strong>every single claim links back to a verbatim quote</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-base font-bold transition-all shadow-xl shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Explore Live Handover Demo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard/projects"
            className="w-full sm:w-auto px-9 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 hover:border-slate-600 cursor-pointer"
          >
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            <span>View Ingested Sources & Graph</span>
          </Link>
        </div>

        {/* Guaranteed Principles Pill Bar */}
        <div className="pt-12 flex flex-wrap justify-center gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verbatim Quote Verification
          </span>
          <span className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Tier Zero-Crash LLM
          </span>
          <span className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Role-Partitioned Access Clearance
          </span>
          <span className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 0–100 Readiness Score
          </span>
        </div>
      </section>

      {/* The Knowledge Loss Problem vs BATON */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-widest">
            The Knowledge-Loss Dilemma
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Conventional Project Handover Fails
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Handoffs typically fail in one of two ways: too little context leaving successors guessing, 
            or an overwhelming dump of unstructured folders that takes weeks to sort through.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Handover */}
          <div className="bg-rose-950/25 border border-rose-900/50 p-8 rounded-2xl space-y-5">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>The Typical Reality: Disjointed Docs & Folder Dumps</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base mt-0.5">✕</span>
                <span><strong>Hallucinates Context:</strong> Standard AI summarizers generate plausible-sounding text with zero verbatim citations to actual chat logs or tickets.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base mt-0.5">✕</span>
                <span><strong>Loses the &quot;Why&quot;:</strong> Decisions are stated without rationale, leaving successors with no clue why specific architectures or tools were rejected.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base mt-0.5">✕</span>
                <span><strong>Accidental Leaks:</strong> A single unstructured handover document leaks confidential credentials, partner contracts, or master keys to new interns.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base mt-0.5">✕</span>
                <span><strong>Exhausting for the Leaver:</strong> Departing members face massive blank documents when they are in a hurry or disengaged.</span>
              </li>
            </ul>
          </div>

          {/* The BATON Way */}
          <div className="bg-blue-950/25 border border-blue-800/60 p-8 rounded-2xl space-y-5 shadow-xl shadow-blue-950/40">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span>The BATON Way: Grounded, Verified Continuity</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base mt-0.5">✓</span>
                <span><strong>Verbatim Quote Verification:</strong> Every single claim must quote the exact source text. If a quote is not found, it is demoted to Inferred, never shown as fact.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base mt-0.5">✓</span>
                <span><strong>Decision Archaeology:</strong> Explicitly reconstructs what was chosen, who agreed, and which alternatives were rejected.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base mt-0.5">✓</span>
                <span><strong>Role-Partitioned Views:</strong> Handover packets are compiled strictly from evidence the viewer is cleared to see (Public, Internal, Confidential, Restricted).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base mt-0.5">✓</span>
                <span><strong>Fast 1-Click Handover Flow:</strong> Departing members get skippable, high-impact prompt flows that take minutes rather than weeks.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Engineered for Rigorous Trust</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How BATON Works End-to-End
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            From raw, unorganized project history to an approved, cryptographically signed handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-extrabold text-base border border-blue-500/30">
              1
            </div>
            <h4 className="font-bold text-base text-white">1. Ingest Sources</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload meeting notes, chat logs, PDF specs, or repo exports. Text is chunked with stable IDs, and secrets/PII are redacted before AI sees them.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-extrabold text-base border border-indigo-500/30">
              2
            </div>
            <h4 className="font-bold text-base text-white">2. Extract Claims</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our multi-tier engine extracts structured claims across 12 categories: decisions, blockers, risks, ownership, and recurring problems.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-extrabold text-base border border-purple-500/30">
              3
            </div>
            <h4 className="font-bold text-base text-white">3. Verify & Review</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The deterministic verifier checks verbatim quotes against source chunks. Leads review claims side-by-side with source text before approving.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-extrabold text-base border border-emerald-500/30">
              4
            </div>
            <h4 className="font-bold text-base text-white">4. Onboard Successor</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generates tailored Day 1, Week 1, and Day 30 plans. Successors get living runbooks and can ask questions to the grounded project assistant.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-6 text-sm text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <span className="font-bold text-slate-300 text-base">BATON</span>
            <span className="text-slate-400">— Pass the project, not just the files.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span>Team MH12 • CodersInPune 2026</span>
            <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Launch Platform</Link>
            <Link href="/login" className="hover:text-blue-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
