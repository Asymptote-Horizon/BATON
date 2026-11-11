"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";
import { 
  FolderGit2, 
  FileSpreadsheet, 
  CheckSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  Zap
} from "lucide-react";
import { InitiateHandoverModal } from "@/components/InitiateHandoverModal";

export default function OverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [risks, setRisks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverDetails, setHandoverDetails] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAnalytics(),
      api.getProjects()
    ])
      .then(([analyticsRes, projs]) => {
        setData(analyticsRes);
        const pid = projs[0]?.id;
        if (pid) {
          Promise.all([
            api.getReadiness(pid).catch(() => null),
            api.getRiskRadar(pid).catch(() => null)
          ]).then(([rData, riskData]) => {
            setReadiness(rData);
            setRisks(riskData);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading continuity intelligence...</p>
        </div>
      </div>
    );
  }

  const totalClaims = (data?.verified_claims || 0) + (data?.evidence_backed_claims || 0) + (data?.conflicting_claims || 0) + (data?.missing_information || 0) + (data?.inferred_claims || 0);
  const coveragePercent = totalClaims > 0 ? Math.round(((data?.verified_claims || 0) / totalClaims) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Big Hero Banner: The Core Leaver Handover Action */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Continuity Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Departing or Transferring Ownership?
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Don&apos;t let unwritten decisions and deployment workarounds disappear. Trigger a streamlined handover to allocate your responsibilities, answer quick skippable questions, and pass the baton.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm sm:text-base font-bold transition-all shadow-xl shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Initiate Handover</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard/handovers"
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Handover Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Project Status Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {handoverDetails ? "Handover Dispatched" : "Active Handover"}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">
              Outgoing: <strong className="text-slate-200">Alex Mercer</strong> → Incoming: <strong className="text-slate-200">{handoverDetails?.successor || "Sam Taylor"}</strong>
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            Project Aether – Autonomous Mobile Robotics (AMR)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Autonomous ground vehicle initiative migrating from ROS1 Noetic to ROS2 Humble with Cartographer 3D SLAM.
          </p>
        </div>

        {/* Readiness Score Pill */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Readiness Score</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {readiness?.overall_score || 53.6}<span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
            readiness?.readiness_grade === "Ready"
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-700/60"
              : readiness?.readiness_grade === "Blocked"
              ? "bg-rose-950/40 text-rose-400 border-rose-700/60"
              : "bg-amber-950/40 text-amber-400 border-amber-700/60"
          }`}>
            {readiness?.readiness_grade || "Blocked"}
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Knowledge Coverage */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Knowledge Coverage</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{coveragePercent}%</span>
            <span className="text-xs text-slate-400 font-semibold">{data?.verified_claims} / {totalClaims} claims</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${coveragePercent}%` }} />
          </div>
        </div>

        {/* 2. Critical Risks */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Risks</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400">{risks?.critical_count || 2}</span>
            <span className="text-xs text-slate-400 font-semibold">{risks?.total_risks || 8} total tracked</span>
          </div>
          <p className="text-xs text-rose-300/80 truncate font-medium">Kafka broker & Vault root token silos</p>
        </div>

        {/* 3. Pending Reviews */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Reviews</span>
            <CheckSquare className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">{data?.pending_reviews || 3}</span>
            <span className="text-xs text-slate-400 font-semibold">Awaiting Lead</span>
          </div>
          <p className="text-xs text-slate-400 truncate">Elena Rostova sign-off required</p>
        </div>

        {/* 4. Active Handovers */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Handovers</span>
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data?.active_handovers || 1}</span>
            <span className="text-xs text-emerald-400 font-semibold">Version 1.0</span>
          </div>
          <p className="text-xs text-slate-400 truncate">Role views generated & secured</p>
        </div>
      </div>

      {/* Two Column Layout: Readiness Breakdown & Critical Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 6-Pillar Readiness Score Breakdown */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Handover Readiness Pillars</h3>
              <p className="text-xs text-slate-400">Deterministic 6-factor continuity evaluation</p>
            </div>
            <Link href="/dashboard/handovers" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View Handover →
            </Link>
          </div>

          <div className="space-y-3.5">
            {readiness?.categories?.map((cat: any, idx: number) => {
              const pct = Math.round((cat.score / cat.max_score) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <span className="font-bold text-white">
                      {cat.score} / {cat.max_score} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Continuity Action Hub</h3>
              <p className="text-xs text-slate-400">Essential workflows to achieve full handover sign-off</p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/sources"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Upload New Sources
                    </div>
                    <div className="text-xs text-slate-400">PDFs, meeting notes, chat exports, task boards</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/dashboard/claims"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Review & Verify Claims
                    </div>
                    <div className="text-xs text-slate-400">Audit extracted decisions against verbatim quotes</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/dashboard/assistant"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                      Ask Project AI
                    </div>
                    <div className="text-xs text-slate-400">Grounded conversational assistant for successors</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-between text-xs text-blue-300">
            <span>Need a refresher on how the scoring works?</span>
            <Link href="/dashboard/handovers" className="font-bold underline hover:text-white">
              Open Runbooks
            </Link>
          </div>
        </div>
      </div>

      {/* Global Initiate Handover Modal */}
      <InitiateHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        projectId="project_aether"
        onHandoverInitiated={(details) => setHandoverDetails(details)}
      />
    </div>
  );
}
