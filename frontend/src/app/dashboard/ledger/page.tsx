"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Claim, ClaimStatus, ClaimCategory } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { SensitivityBadge } from "@/components/SensitivityBadge";
import { 
  Layers, 
  SearchCode, 
  AlertTriangle, 
  HelpCircle, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ShieldCheck, 
  FileText,
  Search,
  Filter,
  Check,
  RefreshCw,
  X
} from "lucide-react";

const TABS = [
  { id: "ledger", name: "Claims", icon: Layers },
  { id: "evidence", name: "Evidence", icon: SearchCode },
  { id: "conflicts", name: "Gaps & Conflicts", icon: AlertTriangle },
  { id: "decisions", name: "Decisions", icon: Compass },
];

export default function KnowledgeLedgerPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Split-screen evidence selection
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // 6-Stage Verification Modal State
  const [verificationModalClaim, setVerificationModalClaim] = useState<Claim | null>(null);
  const [verificationReport, setVerificationReport] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) {
        setProjectId(pid);
        Promise.all([
          api.getClaims(pid),
          api.getDecisions(pid).catch(() => [])
        ]).then(([cls, decs]) => {
          setClaims(cls);
          setDecisions(decs);
          if (cls.length > 0) setSelectedClaim(cls[0]);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleOpenVerification = async (claim: Claim) => {
    setVerificationModalClaim(claim);
    setVerifying(true);
    setVerificationReport(null);
    try {
      const report = await api.getClaimVerificationDetail(claim.id);
      setVerificationReport(report);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleReverify = async () => {
    if (!verificationModalClaim) return;
    setVerifying(true);
    try {
      const report = await api.reverifyClaim(verificationModalClaim.id);
      setVerificationReport(report);
      // Update claim in list
      setClaims((prev) => prev.map((c) => c.id === verificationModalClaim.id ? { ...c, status: report.final_recommended_status } : c));
    } catch (err) {
      console.error("Re-verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    const matchesSearch = c.description.toLowerCase().includes(search.toLowerCase()) || 
                          (c.exact_quote && c.exact_quote.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const conflictsAndGaps = claims.filter((c) => c.status === "Conflict" || c.status === "Missing");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Central Knowledge Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified knowledge claims grounded in exact verbatim citations, multi-stage pipelines & decision logs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading Knowledge Ledger...
        </div>
      ) : (
        <>
          {/* TAB 1: Claims Ledger */}
          {activeTab === "ledger" && (
            <div className="space-y-4">
              {/* Filter Strip */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search claims or exact quotation text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg shadow-xs font-medium text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Statuses ({claims.length})</option>
                    <option value="Verified">Verified</option>
                    <option value="Evidence-backed">Evidence-backed</option>
                    <option value="Inferred">Inferred</option>
                    <option value="Conflict">Conflict</option>
                    <option value="Missing">Missing</option>
                    <option value="Unverified">Unverified</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg shadow-xs font-medium text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Decision">Decisions</option>
                    <option value="Task Ownership">Task Ownership</option>
                    <option value="Pending Task">Pending Tasks</option>
                    <option value="Dependency">Dependencies</option>
                    <option value="Blocker">Blockers</option>
                    <option value="Risk">Risks</option>
                    <option value="Deployment & Access">Deployment & Access</option>
                  </select>
                </div>
              </div>

              {/* Claims Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="p-3.5">Category & Claim</th>
                        <th className="p-3.5">Exact Source Quotation</th>
                        <th className="p-3.5">Grounding Location</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Sensitivity</th>
                        <th className="p-3.5 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredClaims.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 max-w-xs space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                              {c.category}
                            </span>
                            <p className="font-semibold text-white leading-snug">
                              {c.description}
                            </p>
                          </td>

                          <td className="p-3.5 max-w-sm">
                            {c.exact_quote ? (
                              <blockquote className="text-[11px] text-slate-300 italic border-l-2 border-blue-500 pl-2 line-clamp-2">
                                "{c.exact_quote}"
                              </blockquote>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">No exact quotation (Inferred/Missing)</span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                            {c.evidence_location || "Ledger record"}
                          </td>

                          <td className="p-3.5">
                            <StatusBadge status={c.status} />
                          </td>

                          <td className="p-3.5">
                            <SensitivityBadge level={c.sensitivity} />
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleOpenVerification(c)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-900/40 hover:text-blue-300 text-slate-300 font-semibold text-[11px] border border-slate-700 transition-colors cursor-pointer"
                            >
                              Verify Pipeline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Split Evidence Viewer */}
          {activeTab === "evidence" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
              {/* Left Column: Claim Selector */}
              <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-3.5 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white">Select Claim to Trace Evidence</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800 p-2 space-y-1">
                  {claims.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedClaim?.id === c.id
                          ? "bg-blue-950/60 border border-blue-800 shadow-xs"
                          : "hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{c.category}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Source Document Viewer & Exact Span Highlight */}
              <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      Grounded Evidence Inspector
                    </span>
                  </div>
                  {selectedClaim && (
                    <button
                      onClick={() => handleOpenVerification(selectedClaim)}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                    >
                      View 6-Stage Proof →
                    </button>
                  )}
                </div>

                {selectedClaim ? (
                  <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Selected Claim:</span>
                      <h4 className="text-sm font-bold text-white">{selectedClaim.description}</h4>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Evidence Location:</span>
                        <span className="font-mono font-semibold text-slate-200">{selectedClaim.evidence_location || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Confidence Score:</span>
                        <span className="font-mono font-bold text-emerald-400">{Math.round(selectedClaim.confidence * 100)}% Grounded</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Verbatim Source Span (Exact Match):
                      </span>
                      {selectedClaim.exact_quote ? (
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-mono">
                          <span className="bg-blue-950 text-blue-300 border border-blue-800 font-semibold px-1.5 py-0.5 rounded">
                            "{selectedClaim.exact_quote}"
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No exact source quote available for this claim.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-500">Select a claim from the left panel.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Conflicts & Knowledge Gaps */}
          {activeTab === "conflicts" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 leading-relaxed">
                <span className="font-bold">Principle of Preserved Uncertainty: </span>
                BATON never silently averages contradictory claims. Opposing evidence and missing information remain visibly flagged until explicitly reconciled.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conflictsAndGaps.map((item) => (
                  <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {item.category}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{item.description}</h4>

                    {item.exact_quote && (
                      <blockquote className="text-xs text-slate-300 italic border-l-2 border-rose-500 pl-2">
                        "{item.exact_quote}"
                      </blockquote>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{item.evidence_location || "Ledger record"}</span>
                      <button
                        onClick={() => handleOpenVerification(item)}
                        className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                      >
                        Run Verification →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Decision Archaeology */}
          {activeTab === "decisions" && (
            <div className="space-y-4">
              {decisions.map((dec) => (
                <div key={dec.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{dec.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-emerald-950/60 text-emerald-400 border-emerald-800">
                        {dec.reversal_status}
                      </span>
                    </div>
                    {dec.decided_date && <span className="text-xs text-slate-400 font-mono">{dec.decided_date}</span>}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    <span className="text-slate-500 font-normal">What was decided: </span>{dec.what_decided}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">Rationale: </span>{dec.why_selected}
                  </div>

                  {dec.alternatives_considered && dec.alternatives_considered.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Alternatives Considered:</span>
                      <div className="flex flex-wrap gap-1">
                        {dec.alternatives_considered.map((alt: string, i: number) => (
                          <span key={i} className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 6-STAGE CLAIM VERIFICATION MODAL */}
      {verificationModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                    Claim ID: {verificationModalClaim.id.substring(0, 8)}
                  </span>
                  <StatusBadge status={verificationModalClaim.status} />
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Multi-Stage Verification Diagnostic
                </h3>
              </div>

              <button
                onClick={() => setVerificationModalClaim(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Claim Summary */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-slate-400">Claim Description:</span>
              <p className="font-bold text-white">{verificationModalClaim.description}</p>
            </div>

            {/* 6 Diagnostic Stages */}
            {verifying ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Executing 6-stage deterministic verification pipeline...
              </div>
            ) : verificationReport?.stages ? (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Pipeline Diagnostic Results
                </span>

                {Object.entries(verificationReport.stages).map(([stageKey, stage]: [string, any], idx) => (
                  <div key={stageKey} className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-3 text-xs">
                    <div className="mt-0.5">
                      {stage.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          Stage {idx + 1}: {stage.name}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          stage.passed ? "bg-emerald-950/60 text-emerald-400 border-emerald-800" : "bg-rose-950/60 text-rose-400 border-rose-800"
                        }`}>
                          {stage.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-snug">{stage.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Modal Footer Controls */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Recommended Status: <strong className="text-white">{verificationReport?.final_recommended_status || "Evaluating..."}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReverify}
                  disabled={verifying}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {verifying ? "Verifying..." : "Re-Execute Pipeline"}
                </button>
                <button
                  onClick={() => setVerificationModalClaim(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

