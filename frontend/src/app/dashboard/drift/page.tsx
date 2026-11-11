"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Activity,
  Layers
} from "lucide-react";

interface DriftItem {
  id: string;
  drift_type: string;
  title: string;
  baseline_value: string;
  current_value: string;
  severity: string;
  detected_source: string;
  impact: string;
  recommended_action: string;
}

interface DriftData {
  project_id: string;
  drift_score: number;
  total_drifts: number;
  items: DriftItem[];
}

export default function DriftDetectorPage() {
  const [data, setData] = useState<DriftData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) {
        api.getDrift(pid).then((res) => {
          setData(res);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Knowledge Drift Detector</h1>
            <span className="text-xs bg-amber-950/80 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-800">
              Temporal Divergence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detecting architectural contradictions, outdated instructions, and unannounced ownership transitions across source versions.
          </p>
        </div>

        {data && (
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Stability Metric</span>
              <span className="text-base font-extrabold text-blue-400">{data.drift_score}% Consistent</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {loading || !data ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Analyzing temporal drift across sources...
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                      {item.drift_type.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      item.severity === "critical"
                        ? "bg-rose-950/80 text-rose-300 border-rose-800"
                        : item.severity === "high"
                        ? "bg-amber-950/80 text-amber-300 border-amber-800"
                        : "bg-blue-950/80 text-blue-300 border-blue-800"
                    }`}>
                      {item.severity} severity
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {item.title}
                  </h3>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {item.detected_source}
                </span>
              </div>

              {/* Side by Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Baseline (Earlier Sources)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {item.baseline_value}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-850/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Current Divergence (Recent Evidence)
                  </span>
                  <p className="text-xs text-amber-200 leading-relaxed font-mono font-medium">
                    {item.current_value}
                  </p>
                </div>
              </div>

              {/* Impact & Recommended Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-rose-400 block mb-1">Operational Impact:</span>
                  <p className="text-slate-300 leading-relaxed">{item.impact}</p>
                </div>
                <div>
                  <span className="font-bold text-blue-400 block mb-1">Reconciliation Action:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">{item.recommended_action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

