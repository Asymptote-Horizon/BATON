"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  HelpCircle,
  CornerDownLeft,
  RotateCcw,
  Plus,
  AtSign,
  Filter,
  Check
} from "lucide-react";

interface Citation {
  source_id: string;
  source_name: string;
  chunk_id?: string;
  location: string;
  exact_quote: string;
  confidence: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  confidence?: number;
  groundingStatus?: string;
  citations?: Citation[];
  followUps?: string[];
  missingEvidenceNote?: string;
  timestamp: string;
}

const SCOPES = [
  { id: "all", label: "All Project Evidence", icon: FileText },
  { id: "decisions", label: "Decisions & Architecture", icon: Sparkles },
  { id: "runbooks", label: "Runbooks & Deployments", icon: ShieldCheck },
  { id: "risks", label: "Risks & Blockers", icon: AlertTriangle },
];

const SAMPLE_QUESTIONS = [
  "Hi, what is this project about?",
  "Why did we select the Livox Mid-360 LiDAR?",
  "Who owns the Kafka telemetry pipeline?",
  "What are the biggest project risks?",
  "What should I complete on Day 1?",
  "What is the secret CANARY_PROD_HSM_KEY_994X?"
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "👋 **Hello! I am your BATON Project Continuity Assistant.**\n\nEvery answer I provide is strictly grounded in authorized project sources with exact verbatim citations. I will never hallucinate or invent unverified facts, and restricted canary tokens are strictly shielded from unapproved roles.\n\nHow can I help you take over **Project Aether**?",
      confidence: 1.0,
      groundingStatus: "verified_grounded",
      citations: [],
      followUps: [
        "Why was Cartographer 3D SLAM chosen?",
        "Who owns the telemetry and Kafka pipeline?",
        "What are the critical project risks?",
        "What should I do on Day 1?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [activeScope, setActiveScope] = useState("all");
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) setProjectId(pid);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || !projectId || loading) return;

    const scopedQuery = activeScope !== "all" ? `[Scope: ${activeScope}] ${q}` : q;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askAssistant(projectId, scopedQuery);
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        confidence: res.confidence,
        groundingStatus: res.grounding_status,
        citations: res.citations || [],
        followUps: res.follow_up_suggestions || [],
        missingEvidenceNote: res.missing_evidence_note,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: "assistant",
          text: `Error retrieving grounded evidence: ${err.message || "Failed to communicate with RAG engine"}`,
          groundingStatus: "ungrounded_refusal",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Ask Project AI</h1>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Multi-Tier Grounded RAG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Permission-filtered conversational intelligence strictly grounded in verbatim project evidence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">Active Scope:</span>
          <div className="relative">
            <button
              onClick={() => setScopeMenuOpen(!scopeMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-blue-400 font-semibold hover:bg-slate-850 cursor-pointer"
            >
              <AtSign className="w-3.5 h-3.5" />
              <span className="capitalize">{activeScope}</span>
            </button>

            {scopeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                {SCOPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveScope(s.id);
                      setScopeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer ${
                      activeScope === s.id ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{s.label}</span>
                    {activeScope === s.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm overflow-y-auto space-y-5">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${
                isUser ? "bg-blue-600" : "bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>

              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2.5 shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : m.groundingStatus === "ungrounded_refusal"
                    ? "bg-rose-950/40 border border-rose-800/80 text-rose-200 rounded-tl-none"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}>
                  <div className="whitespace-pre-line font-normal leading-relaxed">
                    {m.text}
                  </div>

                  {/* Grounding & Confidence Badges for Assistant */}
                  {!isUser && m.confidence !== undefined && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-[10px]">
                      <span className={`font-bold uppercase px-2 py-0.5 rounded border ${
                        m.groundingStatus === "verified_grounded" || m.groundingStatus === "grounded"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                          : m.groundingStatus === "ungrounded_refusal"
                          ? "bg-rose-950/40 text-rose-400 border-rose-800"
                          : "bg-amber-950/40 text-amber-400 border-amber-800"
                      }`}>
                        {m.groundingStatus === "verified_grounded" ? "Verified Grounded" : m.groundingStatus}
                      </span>
                      <span className="text-slate-400 font-mono">
                        Confidence: {Math.round(m.confidence * 100)}%
                      </span>
                      <span className="text-slate-500 ml-auto">{m.timestamp}</span>
                    </div>
                  )}

                  {/* Citations Box */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-400" />
                        Grounded Citations ({m.citations.length})
                      </span>
                      <div className="space-y-1.5">
                        {m.citations.map((c, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-blue-400">{c.source_name}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{c.location}</span>
                            </div>
                            <blockquote className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-2 py-0.5">
                              &quot;{c.exact_quote}&quot;
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow-up question chips */}
                {!isUser && m.followUps && m.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.followUps.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Retrieving authorized project chunks and synthesizing grounded answer...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">Suggested:</span>
        {SAMPLE_QUESTIONS.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-xl border border-slate-800 whitespace-nowrap shadow-sm transition-colors cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex-shrink-0 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask a question about Project Aether (type @ to filter scope)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white rounded-xl shadow-lg focus:outline-none focus:border-blue-500 font-medium disabled:opacity-50 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => setScopeMenuOpen(!scopeMenuOpen)}
            className="absolute right-12 top-2.5 p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
            title="Attach scope filter"
          >
            <AtSign className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-40 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
