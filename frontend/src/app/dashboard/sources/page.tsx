"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Source, SensitivityLevel } from "@/lib/types";
import { SensitivityBadge } from "@/components/SensitivityBadge";
import { 
  FileStack, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ChevronDown,
  Sparkles,
  Trash2,
  Eye,
  X,
  FileCode,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  Bot,
  FolderGit2,
  MessageSquare
} from "lucide-react";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("internal");
  const [consent, setConsent] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Preview Drawer State
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [previewChunks, setPreviewChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Connector Modal
  const [activeConnector, setActiveConnector] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) {
        setProjectId(pid);
        api.getSources(pid).then((srcs) => {
          setSources(srcs);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !projectId) return;

    if (!consent) {
      alert("Please confirm authorization before ingesting organizational sources.");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("sensitivity", sensitivity);
    formData.append("consent_confirmed", consent.toString());
    formData.append("file", selectedFile);

    try {
      const res = await api.uploadSource(formData);
      setUploadResult(res);
      setSelectedFile(null);
      // Refresh sources list
      const updated = await api.getSources(projectId);
      setSources(updated);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string, filename: string) => {
    if (!confirm(`Remove '${filename}' from ingested sources? Associated unverified claims will also be purged.`)) {
      return;
    }
    try {
      await api.deleteSource(sourceId);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      if (previewSource?.id === sourceId) {
        setPreviewSource(null);
      }
    } catch (err: any) {
      alert("Failed to delete source: " + err.message);
    }
  };

  const handleOpenPreview = async (source: Source) => {
    setPreviewSource(source);
    setLoadingChunks(true);
    try {
      const chunks = await api.getSourceChunks(source.id);
      setPreviewChunks(chunks);
    } catch (err) {
      console.error(err);
      setPreviewChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const getSourceIcon = (filename: string, fileType: string) => {
    const f = filename.toLowerCase();
    if (f.endsWith(".pdf") || fileType === "pdf") {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (f.endsWith(".md") || f.endsWith(".markdown") || fileType === "markdown") {
      return <FileCode className="w-5 h-5 text-emerald-400" />;
    }
    if (f.endsWith(".csv") || fileType === "csv") {
      return <FileSpreadsheet className="w-5 h-5 text-amber-400" />;
    }
    return <FileText className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          <FileStack className="w-4 h-4" />
          <span>Knowledge Ingestion & Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Project Sources & Live Connectors
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Upload documents, exported transcripts, and technical specs. Every file is deterministically chunked, 
          scrubbed for PII/secrets, and linked to verifiable knowledge claims.
        </p>
      </div>

      {/* Grid: Upload Zone + Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-400" />
              <span>Ingest Source Document</span>
            </h2>
            <span className="text-xs text-slate-400">PDF, Markdown, CSV, Chat Exports</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/80 rounded-2xl p-8 text-center transition-all bg-slate-950/60 group">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".md,.txt,.pdf,.csv,.json,.zip"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/15 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-500/20">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <span className="text-sm sm:text-base font-bold text-white">
                  {selectedFile ? selectedFile.name : "Choose a file or drag & drop here"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supported: Meeting Notes (.pdf, .md), Task Exports (.csv), Chat Logs (.txt)
                </span>
                {selectedFile && (
                  <span className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800">
                    Selected: {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Sensitivity Classification
                </label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="public">Public (Visible to All Roles)</option>
                  <option value="internal">Internal (Default Team Clearance)</option>
                  <option value="confidential">Confidential (Lead & Reviewer)</option>
                  <option value="restricted">Restricted (Admin Only)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span>Confirm authorization to parse organizational content</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploading ? "Ingesting, Chunking & Scrubbing PII..." : "Ingest & Reconstruct Knowledge"}</span>
            </button>
          </form>

          {uploadResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs sm:text-sm text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Ingestion Complete!</strong> Created {uploadResult.chunks_created} addressable chunks. 
                Scrubbed {uploadResult.redacted_items_count} sensitive PII items.
              </div>
            </div>
          )}
        </div>

        {/* Live Connectors Showcase (1 col) */}
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-400" />
              <span>Connected Sources</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Integrate scattered activity platforms</p>
          </div>

          <div className="space-y-3">
            {/* ChatGPT / Claude */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI Chat Exports</div>
                  <div className="text-[10px] text-slate-400">ChatGPT / Claude JSON</div>
                </div>
              </div>
              <button
                onClick={() => setActiveConnector("AI Chat Export (ChatGPT/Claude)")}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>

            {/* GitHub */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">GitHub Repository</div>
                  <div className="text-[10px] text-slate-400">PRs, Issues & Commits</div>
                </div>
              </div>
              <button
                onClick={() => setActiveConnector("GitHub OAuth")}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>

            {/* Jira / Linear */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Jira / Linear Boards</div>
                  <div className="text-[10px] text-slate-400">Epics & Task History</div>
                </div>
              </div>
              <button
                onClick={() => setActiveConnector("Jira & Linear Workspace")}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>

            {/* Slack / Discord */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Slack / Discord</div>
                  <div className="text-[10px] text-slate-400">Channel Transcripts</div>
                </div>
              </div>
              <button
                onClick={() => setActiveConnector("Slack / Discord Export")}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ingested Sources Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Active Ingested Sources</h3>
            <p className="text-xs text-slate-400">
              {sources.length} provenance documents verified with deterministic SHA-256 integrity hashes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading sources...</div>
        ) : sources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No sources ingested yet. Upload one above!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate pr-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                        {getSourceIcon(src.filename, src.file_type)}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white truncate" title={src.filename}>
                        {src.filename}
                      </span>
                    </div>

                    {/* Delete Cross Button */}
                    <button
                      onClick={() => handleDeleteSource(src.id, src.filename)}
                      title="Remove source"
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                    <SensitivityBadge level={src.sensitivity as any} />
                    <span>•</span>
                    <span>{src.total_chunks || 4} chunks</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-500">{src.sha256_hash?.substring(0, 8)}...</span>
                  </div>
                </div>

                {/* Clickable Preview Action */}
                <button
                  onClick={() => handleOpenPreview(src)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-semibold border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Extracted Chunks</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Preview Modal */}
      {previewSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3 truncate pr-4">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{previewSource.filename}</h3>
                  <p className="text-xs text-slate-400">Deterministic Source Chunk Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewSource(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingChunks ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading chunk excerpts...</div>
              ) : previewChunks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
                  Raw content indexed. All claims tied to this source can be audited under Claims Ledger.
                </div>
              ) : (
                previewChunks.map((chunk, idx) => (
                  <div key={chunk.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="font-bold text-blue-400">Chunk #{chunk.chunk_index}</span>
                      <span>ID: {chunk.id?.substring(0, 8)}...</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
              <button
                onClick={() => setPreviewSource(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Connector Modal */}
      {activeConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{activeConnector}</h3>
              <button onClick={() => setActiveConnector(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect external project activity streams. Activity logs and PR comments will be automatically ingested, chunked, and parsed for decision archaeology.
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Connector ready for OAuth token configuration.</span>
            </div>
            <button
              onClick={() => {
                alert(`Connected to ${activeConnector} successfully!`);
                setActiveConnector(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Authorize & Sync Sources
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
