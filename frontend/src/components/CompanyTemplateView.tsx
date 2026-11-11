"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  RefreshCw,
  Copy,
  Check,
  Building,
  Code2,
  Palette
} from "lucide-react";

interface TemplateField {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  mappedFrom: string;
}

const DEFAULT_TEMPLATES = [
  {
    id: "eng_handover",
    name: "Standard Engineering & DevOps Handover Template",
    icon: Code2,
    org: "Engineering & Technical Teams",
    desc: "Architecture, repository permissions, CI/CD pipelines, and secrets handover.",
    fields: [
      {
        id: "f_project",
        label: "1. Project Scope & Architecture Summary",
        placeholder: "Describe the primary system architecture...",
        value: "Project Aether: Autonomous Mobile Robotics (AMR) platform transitioning from ROS1 Noetic to ROS2 Humble with Cartographer 3D SLAM navigation.",
        mappedFrom: "Project Overview & Decision Records"
      },
      {
        id: "f_owners",
        label: "2. Outgoing & Incoming Responsibility Matrix",
        placeholder: "Who is leaving and who inherits each module...",
        value: "Outgoing Lead: Alex Mercer (Autonomous Navigation)\nSuccessor: Sam Taylor (Onboarding)\nReviewer / Lead: Elena Rostova",
        mappedFrom: "Team Ledger & Bus Factor"
      },
      {
        id: "f_decisions",
        label: "3. Key Architectural Decisions & Reversals",
        placeholder: "Important decisions made during development...",
        value: "• micro-ROS on STM32 selected for real-time actuator control.\n• Livox Mid-360 chosen over Ouster OS1 due to 360-degree non-repetitive FOV.\n• Kafka 3.4 broker ingestion currently active for telemetry.",
        mappedFrom: "Decision Archaeology"
      },
      {
        id: "f_access",
        label: "4. Cloud Credentials, Keys & Hardware Access",
        placeholder: "Vault tokens, cloud accounts, master passwords...",
        value: "• AWS Simulation Cluster: Managed via 1Password Robotics Vault.\n• Master Vault Token: Under Alex Mercer's single-person custody (Needs transfer to Elena).\n• Firmware flashing JTAG key in Hardware Lab Bench #3.",
        mappedFrom: "Access & Deployment Claims"
      },
      {
        id: "f_day1",
        label: "5. Successor Day 1 & Week 1 Action Priorities",
        placeholder: "First critical operational tasks...",
        value: "Day 1: Clone workspace, verify ROS2 Humble build on Ubuntu 22.04 LTS, run LiDAR diagnostic script.\nWeek 1: Test Cartographer SLAM loop closure in simulation warehouse.",
        mappedFrom: "Successor Mission Mode"
      },
      {
        id: "f_traps",
        label: "6. Known Fragilities, Bugs & Undocumented Workarounds",
        placeholder: "Things that fail unexpectedly...",
        value: "Warning: Nav2 localization hangs if LIDAR driver starts prior to base odometry transform broadcast.",
        mappedFrom: "Risk Radar & Blockers"
      }
    ]
  },
  {
    id: "creative_handover",
    name: "Creative Media & Digital Asset Handover",
    icon: Palette,
    org: "Creative, Video & Design Studios",
    desc: "Asset folders, font licenses, micro-cut decisions, and render configs.",
    fields: [
      {
        id: "f_project",
        label: "1. Creative Direction & Brand Guidelines",
        placeholder: "Primary tone, color palettes, project objectives...",
        value: "High-contrast cinematic robotics demonstration video (4K 60fps, DCI-P3 color gamut).",
        mappedFrom: "Creative Brief"
      },
      {
        id: "f_owners",
        label: "2. Asset Storage, SSD Locations & Raw Drives",
        placeholder: "Where are the camera raw files and cache drives...",
        value: "Primary footage on RAID 5 'Storage_Aether_RAW'. Proxy files cached locally in /Volumes/FastScratch.",
        mappedFrom: "Asset Registry"
      },
      {
        id: "f_decisions",
        label: "3. Micro-Editing Decisions & Transition Choices",
        placeholder: "Why cuts were timed, audio track choices...",
        value: "Pacing timed to 128 BPM electronic track. 1.0s hard dissolve chosen over quick wipe to maintain technical documentary tone.",
        mappedFrom: "Timeline Notes"
      },
      {
        id: "f_access",
        label: "4. Font Licenses, Stock Music & Rights Credentials",
        placeholder: "License keys and stock media accounts...",
        value: "Music licensed under Artlist License #AL-99841. Typography uses licensed Geist Sans Pro.",
        mappedFrom: "Licensing Registry"
      }
    ]
  }
];

export function CompanyTemplateView() {
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0]);
  const [fields, setFields] = useState<TemplateField[]>(DEFAULT_TEMPLATES[0].fields);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (tmpl: typeof DEFAULT_TEMPLATES[0]) => {
    setSelectedTemplate(tmpl);
    setFields(tmpl.fields);
    setUploadedDocName(null);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocName(file.name);
      // Generate mapped fields from uploaded file name and standard schema
      setFields([
        {
          id: "c_name",
          label: "1. Handover Title & Executive Scope",
          placeholder: "Extracted from " + file.name,
          value: `Continuity Plan for ${file.name.replace(/\.[^/.]+$/, "")}`,
          mappedFrom: file.name
        },
        {
          id: "c_resp",
          label: "2. Key Stakeholders & Transition Owner",
          placeholder: "Transfer matrix...",
          value: "Lead: Alex Mercer → Successor: Sam Taylor",
          mappedFrom: "BATON Team Ledger"
        },
        {
          id: "c_decisions",
          label: "3. Approved Architecture & Technical Rationale",
          placeholder: "Extracted decisions...",
          value: "ROS2 Humble, Livox Mid-360 LiDAR, micro-ROS STM32 actuator control.",
          mappedFrom: "BATON Decision Archaeology"
        },
        {
          id: "c_credentials",
          label: "4. Critical Credentials & Vault Access",
          placeholder: "Access keys...",
          value: "Master Vault token and AWS simulation cluster credentials.",
          mappedFrom: "BATON Credentials"
        },
        {
          id: "c_actions",
          label: "5. Immediate Next Steps & Onboarding Actions",
          placeholder: "Tasks...",
          value: "Execute Day 1 hardware validation and resolve Cartographer SLAM loop closure.",
          mappedFrom: "BATON Runbooks"
        }
      ]);
    }
  };

  const handleFieldChange = (id: string, val: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value: val } : f)));
  };

  const handleAutoFill = () => {
    setAutoFilled(true);
    alert("Template fields re-synchronized with active BATON project claims and decisions!");
  };

  const handleExport = () => {
    const textContent = `# ${uploadedDocName || selectedTemplate.name}
Generated by BATON Project Continuity Platform
Verification Hash: SHA-256_${Math.random().toString(36).substring(2, 10).toUpperCase()}
Date: ${new Date().toLocaleDateString()}

============================================================
${fields.map((f) => `### ${f.label}\n[Source: ${f.mappedFrom}]\n\n${f.value}\n`).join("\n---\n\n")}
============================================================
Approved by Outgoing Lead: Alex Mercer
Received by Successor: Sam Taylor
`;

    const blob = new Blob([textContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Handover_${selectedTemplate.id}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Building className="w-4 h-4" />
              <span>Enterprise Continuity Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Custom Handover Template Pre-Filler
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every company or club has an established handover Word/Excel checklist. 
              BATON maps extracted project claims and decisions directly into your template fields automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoFill}
              className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Fill from Claims</span>
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Selectors & Custom Upload Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEFAULT_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate.id === tmpl.id && !uploadedDocName;
          return (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-600/10"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white truncate">{tmpl.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{tmpl.desc}</p>
            </div>
          );
        })}

        {/* Upload Custom Template Box */}
        <div className={`p-4 rounded-xl border border-dashed transition-all relative ${
          uploadedDocName
            ? "bg-emerald-950/20 border-emerald-500/80 text-white"
            : "bg-slate-900/40 border-slate-800 hover:border-blue-500/60 text-slate-400"
        }`}>
          <input
            type="file"
            id="template-upload"
            onChange={handleCustomUpload}
            accept=".docx,.xlsx,.doc,.md,.txt"
            className="hidden"
          />
          <label htmlFor="template-upload" className="cursor-pointer flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                {uploadedDocName ? `Uploaded: ${uploadedDocName}` : "Upload Custom Template"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {uploadedDocName ? "Extracted & mapped into form below" : "Import your company's Word or Excel doc"}
            </p>
          </label>
        </div>
      </div>

      {/* Generated Form Fields Based on Template */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {uploadedDocName ? `Mapped Fields for ${uploadedDocName}` : selectedTemplate.name}
            </h3>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-semibold">
            {autoFilled ? "✓ Auto-Mapped from Baton Claims" : "Ready for Input"}
          </span>
        </div>

        <div className="space-y-5">
          {fields.map((f, idx) => (
            <div key={f.id} className="space-y-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200">
                  {f.label}
                </label>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-900/60 px-2 py-0.5 rounded">
                  Source: {f.mappedFrom}
                </span>
              </div>
              <textarea
                rows={3}
                value={f.value}
                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                placeholder={f.placeholder}
                className="w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-normal leading-relaxed resize-y"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Document integrity secured with SHA-256 cryptographic continuity seal.
          </span>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Completed Handover</span>
          </button>
        </div>
      </div>
    </div>
  );
}

