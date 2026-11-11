"use client";

import React, { useState } from "react";
import { 
  FolderPlus, 
  X, 
  Sparkles, 
  Layers, 
  Code2, 
  Palette, 
  Building2, 
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

const DOMAINS = [
  { id: "software", label: "Software & Web Engineering", icon: Code2, desc: "Git commits, repos, PRs, technical specs, API routes" },
  { id: "creative", label: "Creative & Media Production", icon: Palette, desc: "VFX, video timelines, micro-editing decisions, brand assets" },
  { id: "architecture", label: "Architecture & Physical Design", icon: Building2, desc: "BIM models, material specs, site photos, drawing revisions" },
  { id: "general", label: "Student Organization & Club", icon: GraduationCap, desc: "Event logs, sponsor contacts, handover checklists, drive folders" },
];

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("software");
  const [description, setDescription] = useState("");
  const [initialLead, setInitialLead] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const newProj = {
        id: "proj_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        slug: slug || "project-" + Date.now(),
        description: description.trim() || `Domain: ${domain.toUpperCase()}`,
        domain,
        initialLead: initialLead.trim() || "Lead Engineer",
        total_sources: 0,
        total_claims: 0,
        total_handovers: 0,
        created_at: new Date().toISOString()
      };

      if (onProjectCreated) {
        onProjectCreated(newProj);
      }
      setCreatedSuccess(true);
      setTimeout(() => {
        setCreatedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Create New Project</h2>
              <p className="text-xs text-slate-400">Initialize a fresh knowledge continuity workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {createdSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Project Initialized!</h3>
            <p className="text-xs text-slate-400">Opening workspace context...</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Chronos, Neon UI System, Formula Student Club..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Project Domain & Handover Context
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DOMAINS.map((d) => {
                  const Icon = d.icon;
                  const isSelected = domain === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setDomain(d.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                        <span className="text-xs font-bold">{d.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{d.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Description / Purpose
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this project builds and current objective..."
                className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Initial Lead / Handover Owner
              </label>
              <input
                type="text"
                value={initialLead}
                onChange={(e) => setInitialLead(e.target.value)}
                placeholder="e.g. Omkar Deshmukh (Lead)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{creating ? "Creating..." : "Create Project"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

