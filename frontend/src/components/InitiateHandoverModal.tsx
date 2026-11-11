"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert,
  Send,
  FastForward,
  User
} from "lucide-react";
import { api } from "@/lib/api";

interface InitiateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onHandoverInitiated?: (details: any) => void;
}

const TEAM_MEMBERS = [
  { name: "Sam Taylor", role: "Successor (Robotics Onboarding)", email: "sam.successor@baton.local" },
  { name: "Elena Rostova", role: "Reviewer (Technical Lead)", email: "elena.reviewer@baton.local" },
  { name: "Marcus Vance", role: "Simulation & Control Engineer", email: "marcus@baton.local" },
  { name: "Priya Patel", role: "Hardware & Sensor Specialist", email: "priya@baton.local" },
  { name: "Unassigned / Lead Pool", role: "Project Manager will allocate successor", email: "admin@baton.local" }
];

export function InitiateHandoverModal({ isOpen, onClose, projectId, onHandoverInitiated }: InitiateHandoverModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [successor, setSuccessor] = useState(TEAM_MEMBERS[0].name);
  const [qTraps, setQTraps] = useState("");
  const [qAccess, setQAccess] = useState("");
  const [qDay1, setQDay1] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFinishHandover = async (skipped = false) => {
    setSubmitting(true);
    try {
      const details = {
        successor,
        notes: skipped ? "Departing member initiated fast handover (questions skipped)." : "Departing member completed quick gap handover questions.",
        traps: qTraps,
        access: qAccess,
        day1_priority: qDay1,
        timestamp: new Date().toISOString()
      };

      if (onHandoverInitiated) {
        onHandoverInitiated(details);
      }
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Initiate Project Handover
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1 && "Step 1 of 2: Designate incoming successor"}
                {step === 2 && "Step 2 of 2: High-impact tribal knowledge (Optional)"}
                {step === 3 && "Handover Dispatched Successfully"}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-300 leading-relaxed">
                Leaving the project? Designate who will receive your task ownership, verified claims, 
                and runbooks. If unsure, assign to <strong>Unassigned / Lead Pool</strong> and your team lead will allocate.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Select Incoming Successor
                </label>
                <div className="space-y-2">
                  {TEAM_MEMBERS.map((m) => (
                    <label
                      key={m.name}
                      onClick={() => setSuccessor(m.name)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                        successor === m.name
                          ? "bg-blue-600/15 border-blue-500/80 text-white font-semibold"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.role}</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="successor"
                        checked={successor === m.name}
                        onChange={() => setSuccessor(m.name)}
                        className="text-blue-600 focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-900/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>In a hurry? These questions are 100% skippable.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFinishHandover(true)}
                  className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Skip All</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    1. Any hidden traps, brittle scripts, or undocumented workarounds?
                  </label>
                  <textarea
                    rows={2}
                    value={qTraps}
                    onChange={(e) => setQTraps(e.target.value)}
                    placeholder="e.g. Nav2 localization fails if LIDAR driver starts before odometry transform..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    2. Who holds key passwords, API credentials, or hardware keys?
                  </label>
                  <textarea
                    rows={2}
                    value={qAccess}
                    onChange={(e) => setQAccess(e.target.value)}
                    placeholder="e.g. AWS simulation credentials are on 1Password in the Robotics vault, Marcus has master key..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    3. What is the single most urgent task the successor should do on Day 1?
                  </label>
                  <textarea
                    rows={2}
                    value={qDay1}
                    onChange={(e) => setQDay1(e.target.value)}
                    placeholder="e.g. Pull latest firmware update on branch v2.3 and run the sensor calibration check..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Handover Successfully Initialized!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Project continuity has been routed to <strong>{successor}</strong>. All verified claims, 
                decisions, runbooks, and risk items are mapped to their onboarding portal.
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
                Handover Hash: SHA-256_{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => handleFinishHandover(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Skip Questions</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleFinishHandover(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? "Compiling..." : "Complete Handover"}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Done & Return to Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

