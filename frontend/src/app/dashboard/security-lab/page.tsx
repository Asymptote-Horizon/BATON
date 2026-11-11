"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  Terminal,
  Activity,
  Sparkles,
  RotateCcw
} from "lucide-react";

interface TestCase {
  test_id: string;
  attack_type: string;
  canary_id: string;
  target_role: string;
  prompt_payload: string;
  canary_token_expected: boolean;
  canary_token_leaked: boolean;
  passed: boolean;
  status_explanation: string;
}

interface SimulationResponse {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  leak_rate_percentage: number;
  shield_status: string;
  results: TestCase[];
}

export default function SecurityLabPage() {
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) setProjectId(pid);
    });
  }, []);

  const handleRunSimulation = async () => {
    if (!projectId || running) return;
    setRunning(true);
    setData(null);

    try {
      const res = await api.runSecuritySimulation(projectId);
      setTimeout(() => {
        setData(res);
        setHasRun(true);
        setRunning(false);
      }, 1200);
    } catch (err) {
      console.error("Simulation failed:", err);
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Privacy & Canary Leak Simulator</h1>
            <span className="text-xs bg-purple-500/15 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Active Defense Lab
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Penetration testing harness verifying that sensitive canary strings and credentials never leak across role boundaries.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Executing Penetration Vectors...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{hasRun ? "Re-Run Security Simulation" : "Run Security Simulation"}</span>
            </>
          )}
        </button>
      </div>

      {/* Clean State Before Simulation */}
      {!hasRun && !running && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/15 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Canary Penetration Harness Ready</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Click below to execute the 5 automated attack vectors against the Assistant RAG layer. 
              Tests evaluate direct extraction, paraphrased probing, and prompt injection across user clearance roles.
            </p>
          </div>
          <button
            onClick={handleRunSimulation}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
          >
            Launch 5 Adversarial Test Vectors
          </button>
        </div>
      )}

      {/* Loading Animation */}
      {running && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Simulating Adversarial Probes...</h3>
          <p className="text-xs text-slate-400 font-mono">
            Evaluating SEC-001 (Direct), SEC-002 (Paraphrase), SEC-003 (Injection), SEC-004 (Cross-Role), SEC-005 (Admin Audit)...
          </p>
        </div>
      )}

      {/* Results Display After Run */}
      {data && !running && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                data.leak_rate_percentage === 0
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}>
                {data.leak_rate_percentage === 0 ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shield Status</span>
                <h3 className="text-lg font-bold text-white">{data.shield_status}</h3>
                <p className="text-xs text-slate-400">
                  {data.passed_tests} of {data.total_tests} adversarial vectors successfully contained.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Leak Rate</span>
                <div className="text-2xl font-extrabold text-emerald-400">{data.leak_rate_percentage}%</div>
              </div>
            </div>
          </div>

          {/* Test Vectors List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Evaluated Adversarial Test Vectors
            </h3>
            {data.results.map((test) => (
              <div
                key={test.test_id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-lg border border-blue-500/30">
                      {test.test_id}
                    </span>
                    <span className="text-xs font-bold text-white capitalize">
                      {test.attack_type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Role: {test.target_role}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {test.passed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Contained
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Leaked
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Adversarial Prompt Payload:</div>
                  <p className="text-xs font-mono text-slate-300">{test.prompt_payload}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {test.status_explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
