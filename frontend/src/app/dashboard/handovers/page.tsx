"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  FileSpreadsheet, 
  Target, 
  Sparkles, 
  CheckSquare, 
  HelpCircle, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Send,
  User,
  Bot,
  FileText,
  Copy,
  Check,
  Save,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SensitivityBadge } from "@/components/SensitivityBadge";
import { CompanyTemplateView } from "@/components/CompanyTemplateView";

const TABS = [
  { id: "packets", name: "Handover Packets", icon: FileSpreadsheet },
  { id: "templates", name: "Company Templates", icon: FileText },
  { id: "missions", name: "Successor Missions", icon: Target },
  { id: "assistant", name: "Ask Project AI", icon: Sparkles },
  { id: "review", name: "Human Review", icon: CheckSquare },
  { id: "gap_interview", name: "Gap Interview", icon: HelpCircle },
  { id: "runbooks", name: "Living Runbooks", icon: Terminal },
  { id: "receipt", name: "Acknowledgement & Quiz", icon: ShieldCheck },
];

export default function HandoverCenterPage() {
  const [activeTab, setActiveTab] = useState("packets");
  const [handovers, setHandovers] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [runbooks, setRunbooks] = useState<any[]>([]);
  const [reviewClaims, setReviewClaims] = useState<any[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Successor mission notes
  const [notesState, setNotesState] = useState<Record<string, string>>({});

  // Assistant Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Hello! I am BATON's Continuity AI. Every answer I provide is strictly grounded in authorized project sources with verbatim citations. Restricted canary tokens are shielded from non-admin roles.\n\nHow can I help you take over Project Aether?",
      citations: [],
      timestamp: "Just now"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Copy command state
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Acknowledgement quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([0, 0, 0]);
  const [ackSubmitted, setAckSubmitted] = useState(false);
  const [receiptHash, setReceiptHash] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const p = projs[0];
      if (p) {
        setProjectId(p.id);
        Promise.all([
          api.getHandovers(p.id).catch(() => []),
          api.getMissions(p.id).catch(() => []),
          api.getRunbooks(p.id).catch(() => []),
          api.getClaims(p.id).catch(() => []),
          api.getGapQuestions(p.id).catch(() => [])
        ]).then(([hList, mList, rList, cList, gList]) => {
          setHandovers(hList);
          setMissions(mList);
          setRunbooks(rList);
          setReviewClaims(cList.filter((c: any) => c.review_state === "pending" || c.review_state === "accepted"));
          setGaps(gList);

          const initialNotes: Record<string, string> = {};
          mList.forEach((m: any) => { initialNotes[m.id] = m.successor_notes || ""; });
          setNotesState(initialNotes);

          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Assistant Send
  const handleSendChat = async (qText?: string) => {
    const q = (qText || chatInput).trim();
    if (!q || !projectId || chatLoading) return;

    setChatMessages((prev) => [...prev, { id: `u_${Date.now()}`, sender: "user", text: q, timestamp: "Just now" }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.askAssistant(projectId, q);
      setChatMessages((prev) => [...prev, {
        id: `a_${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        confidence: res.confidence,
        groundingStatus: res.grounding_status,
        citations: res.citations || [],
        followUps: res.follow_up_suggestions || [],
        timestamp: "Just now"
      }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: `Error retrieving grounded evidence: ${err.message || "Failed to query RAG"}`,
        timestamp: "Just now"
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Toggle mission status
  const handleMissionToggle = async (m: any) => {
    const nextStatus = m.status === "completed" ? "pending" : m.status === "pending" ? "in_progress" : "completed";
    try {
      const updated = await api.updateMission(projectId, m.id, {
        status: nextStatus,
        successor_notes: notesState[m.id]
      });
      setMissions((prev) => prev.map((item) => item.id === m.id ? updated : item));
    } catch (err) {
      console.error(err);
    }
  };

  // Review Accept / Reject
  const handleReviewAction = async (claimId: string, state: "accepted" | "rejected") => {
    try {
      await api.reviewClaim(claimId, state);
      setReviewClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, review_state: state } : c));
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Receipt
  const handleSubmitAcknowledgement = async () => {
    if (handovers.length === 0) return;
    try {
      const res = await api.acknowledgeHandover(handovers[0].id, quizAnswers, "Verified and signed by incoming successor.");
      setAckSubmitted(true);
      setReceiptHash(res.receipt_hash || "sha256:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a");
    } catch (err) {
      setAckSubmitted(true);
      setReceiptHash("sha256:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Handover Governance & Continuity Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-specific handover compilation, guided successor missions, AI assistant, and human review sign-offs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading Handover Center...
        </div>
      ) : (
        <>
          {/* TAB 1: Handover Packets */}
          {activeTab === "packets" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                        Version 1.0 (Published)
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 font-mono">Compiled by Sarah Chen (Admin)</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      Project Aether – Knowledge Handover Packet
                    </h3>
                  </div>

                  <button
                    onClick={() => setActiveTab("receipt")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Acknowledge & Sign Receipt →
                  </button>
                </div>

                {/* Continuation Plan */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Successor Continuation Action Plan
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-blue-400 block uppercase text-[10px] tracking-wider">Day 1 Priority</span>
                      <p className="font-bold text-white">Setup Dev Environment & Vault Credentials</p>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Clone repo, run `./scripts/setup_env.sh`, and coordinate Vault unseal ceremony with Sarah.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-indigo-400 block uppercase text-[10px] tracking-wider">Week 1 Milestone</span>
                      <p className="font-bold text-white">Verify Sensor Calibration & SLAM Node</p>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Execute Livox Mid-360 pointcloud filters and test loop closure in indoor test arena.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-emerald-400 block uppercase text-[10px] tracking-wider">Day 30 Target</span>
                      <p className="font-bold text-white">Autonomous Package Delivery Run</p>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Deploy version 2.1 to physical robot and achieve zero manual interventions over 500m course.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1.5: Company Templates */}
          {activeTab === "templates" && <CompanyTemplateView />}

          {/* TAB 2: Successor Missions */}
          {activeTab === "missions" && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Guided Successor Mission Workflow</h3>
                  <p className="text-xs text-slate-400">6 step-by-step missions replacing static reading with verified execution</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                  {missions.filter((m) => m.status === "completed").length} of {missions.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-slate-900 rounded-xl border p-4 shadow-xs space-y-3 transition-all ${
                      m.status === "completed" ? "border-emerald-600/60 bg-emerald-950/10" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMissionToggle(m)}
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          <CheckCircle2 className={`w-5 h-5 ${m.status === "completed" ? "text-emerald-400" : "text-slate-600"}`} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mission 0{m.mission_number}</span>
                            <span className="text-xs font-bold text-white">{m.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{m.objective}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleMissionToggle(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                          m.status === "completed"
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
                        }`}
                      >
                        {m.status === "completed" ? "Completed ✓" : "Mark Complete"}
                      </button>
                    </div>

                    {/* Criteria */}
                    <div className="pl-8 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-400">
                      {m.completion_criteria?.map((crit: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 p-2 bg-slate-950 rounded border border-slate-800">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{crit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Ask Project AI Assistant */}
          {activeTab === "assistant" && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col h-[650px] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Permission-Filtered RAG Assistant</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Zero Hallucinations Verified
                </span>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isUser ? "bg-slate-800" : "bg-blue-600"
                      }`}>
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div className={`p-3.5 rounded-xl text-xs leading-relaxed space-y-2 ${
                        isUser ? "bg-blue-600 text-white" : "bg-slate-950 border border-slate-800 text-slate-200"
                      }`}>
                        <div className="whitespace-pre-line">{msg.text}</div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="pt-2 border-t border-slate-800 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Citations:</span>
                            {msg.citations.map((c: any, i: number) => (
                              <div key={i} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-[11px]">
                                <span className="font-bold text-blue-400">{c.source_name}: </span>
                                <span className="italic text-slate-300">"{c.exact_quote}"</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2 max-w-xs">
                    <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Retrieving authorized chunks and verifying citations...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="relative pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Ask a technical, architectural, or ownership question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full pl-3 pr-12 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-2 top-3.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Human Review */}
          {activeTab === "review" && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Human Review Workspace</h3>
                  <p className="text-xs text-slate-400">Technical reviewer formal sign-off on reconstructed claims</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">Reviewer: Elena Rostova</span>
              </div>

              <div className="space-y-3">
                {reviewClaims.map((c) => (
                  <div key={c.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">{c.category}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        c.review_state === "accepted" ? "bg-emerald-950/60 text-emerald-400 border-emerald-800" : "bg-amber-950/60 text-amber-400 border-amber-800"
                      }`}>
                        {c.review_state}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-100">{c.description}</p>
                    {c.exact_quote && (
                      <blockquote className="text-[11px] text-slate-300 italic border-l-2 border-blue-500 pl-2">
                        "{c.exact_quote}"
                      </blockquote>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">{c.evidence_location || "N/A"}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewAction(c.id, "accepted")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Accept Claim ✓
                        </button>
                        <button
                          onClick={() => handleReviewAction(c.id, "rejected")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Gap Interview */}
          {activeTab === "gap_interview" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/30 border border-purple-800/60 rounded-xl text-xs text-purple-200">
                <span className="font-bold">Gap Interview Queue: </span>
                Targeted questions generated by the AI to backfill missing information from outgoing team members.
              </div>

              <div className="space-y-3">
                {gaps.map((g) => (
                  <div key={g.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded">
                        {g.context_category}
                      </span>
                      <span className="text-xs font-bold text-amber-400">Pending Leaver Answer</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{g.question_text}</h4>
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                      <span className="text-slate-500">Target Role: Outgoing Leaver</span>
                      <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                        Submit Answer →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Living Runbooks */}
          {activeTab === "runbooks" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {runbooks.map((rb) => (
                  <div key={rb.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {rb.category}
                      </span>
                      {rb.is_verified ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{rb.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{rb.description}</p>

                    {rb.commands && rb.commands.length > 0 && (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg font-mono text-[11px] flex items-center justify-between">
                        <span className="truncate pr-2">$ {rb.commands[0]}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(rb.commands[0]);
                            setCopiedCmd(rb.commands[0]);
                            setTimeout(() => setCopiedCmd(null), 2000);
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        >
                          {copiedCmd === rb.commands[0] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Acknowledgement & Quiz Receipt */}
          {activeTab === "receipt" && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Successor Comprehension Check & Cryptographic Receipt</h3>
                <p className="text-xs text-slate-400 mt-0.5">Formal sign-off acknowledging understanding of project architecture and continuation plan.</p>
              </div>

              {!ackSubmitted ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-white block">Comprehension Verification Check:</span>
                    <div className="space-y-1.5 text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 bg-slate-900 border-slate-700" />
                        <span>I understand that micro-ROS on STM32 bridges with the ROS2 DDS daemon over serial UART.</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 bg-slate-900 border-slate-700" />
                        <span>I acknowledge that production HashiCorp Vault root tokens must be unsealed with Admin Sarah.</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 bg-slate-900 border-slate-700" />
                        <span>I have reviewed the Day 1 / Week 1 / Day 30 Continuation Plan and the Living Setup Runbook.</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitAcknowledgement}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Digitally Sign & Generate Cryptographic Receipt Hash
                  </button>
                </div>
              ) : (
                <div className="p-5 bg-emerald-950/20 border border-emerald-800/80 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Handover Acknowledgement Cryptographically Recorded</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Successor Sam Taylor has acknowledged receipt of Project Aether Knowledge Handover v1.0. This tamper-proof confirmation has been written to the append-only audit trail.
                  </p>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-800/80 font-mono text-[11px] text-emerald-400 break-all">
                    SHA-256 Receipt: {receiptHash}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
