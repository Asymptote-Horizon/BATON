"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Search, 
  ExternalLink,
  BookOpen,
  Plus
} from "lucide-react";

interface Runbook {
  id: string;
  project_id: string;
  title: string;
  category: string;
  description?: string;
  content_markdown: string;
  prerequisites: string[];
  commands: string[];
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
}

const CATEGORY_TABS = [
  { id: "all", name: "All Runbooks" },
  { id: "setup", name: "Setup" },
  { id: "deployment", name: "Deployment" },
  { id: "troubleshooting", name: "Troubleshooting" },
  { id: "recurring", name: "Recurring" },
  { id: "emergency", name: "Emergency DR" },
];

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) {
        setProjectId(pid);
        api.getRunbooks(pid).then((data) => {
          setRunbooks(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleToggleVerify = async (rb: Runbook) => {
    if (!projectId) return;
    try {
      const updated = await api.verifyRunbook(projectId, rb.id, !rb.is_verified);
      setRunbooks((prev) => prev.map((item) => (item.id === rb.id ? updated : item)));
    } catch (err) {
      console.error("Failed to toggle verify runbook:", err);
    }
  };

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredRunbooks = runbooks.filter((rb) => {
    const matchesCategory = selectedCategory === "all" || rb.category === selectedCategory;
    const matchesSearch = rb.title.toLowerCase().includes(search.toLowerCase()) || 
                          rb.content_markdown.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Living Runbook Generator</h1>
            <span className="text-xs bg-cyan-950/80 text-cyan-400 font-semibold px-2.5 py-0.5 rounded-full border border-cyan-800">
              Verified Procedures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic, evidence-linked operational guides replacing obsolete documentation with peer-verified runbooks.
          </p>
        </div>

        {/* Verification Summary */}
        <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 shadow-sm flex items-center gap-2">
          <span className="font-bold text-emerald-400">
            {runbooks.filter((r) => r.is_verified).length} / {runbooks.length}
          </span>
          <span>Runbooks Verified</span>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search runbook content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-60 font-medium"
          />
        </div>
      </div>

      {/* Runbook Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading living runbooks...
        </div>
      ) : filteredRunbooks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No runbooks match your category or search query.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRunbooks.map((rb) => (
            <div
              key={rb.id}
              className={`bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                rb.is_verified ? "border-slate-800" : "border-amber-700/80 ring-1 ring-amber-800/40"
              }`}
            >
              {/* Header Bar */}
              <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                      {rb.category}
                    </span>
                    {rb.is_verified ? (
                      <span className="text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified by {rb.verified_by || "Reviewer"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Pending Peer Verification
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {rb.title}
                  </h3>
                  {rb.description && (
                    <p className="text-xs text-slate-400">
                      {rb.description}
                    </p>
                  )}
                </div>

                {/* Sign-off Action */}
                <button
                  onClick={() => handleToggleVerify(rb)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
                    rb.is_verified
                      ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{rb.is_verified ? "Revoke Verification" : "Sign Off & Verify ✓"}</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Prerequisites Strip */}
                {rb.prerequisites && rb.prerequisites.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Required Prerequisites
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rb.prerequisites.map((p, idx) => (
                        <span key={idx} className="text-xs bg-slate-900 text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-800">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Runnable Snippets */}
                {rb.commands && rb.commands.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Quick Execution Commands
                    </span>
                    <div className="space-y-1.5">
                      {rb.commands.map((cmd, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs border border-slate-800 shadow-inner"
                        >
                          <span className="truncate pr-3">$ {cmd}</span>
                          <button
                            onClick={() => copyToClipboard(cmd)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                            title="Copy command"
                          >
                            {copiedCmd === cmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Runbook Content */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="prose prose-invert prose-sm max-w-none text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200">
                      {rb.content_markdown}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

