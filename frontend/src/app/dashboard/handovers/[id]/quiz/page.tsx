"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { HandoverVersion, ComprehensionCheck } from "@/lib/types";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  Hash, 
  Calendar,
  Sparkles
} from "lucide-react";

export default function ComprehensionQuizPage() {
  const params = useParams();
  const router = useRouter();
  const handoverId = params.id as string;

  const [handover, setHandover] = useState<HandoverVersion | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    if (handoverId) {
      api.getProject("project-aether").then((p) => {
        api.getHandovers(p.id).then((hos) => {
          const match = hos.find((h) => h.id === handoverId) || hos[0];
          setHandover(match);
          setLoading(false);
        });
      });
    }
  }, [handoverId]);

  const checks = handover?.comprehension_checks || [];

  const handleSelectAnswer = (qIdx: number, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optionIdx });
  };

  const handleSubmitQuiz = async () => {
    const answersArray: number[] = [];
    for (let i = 0; i < checks.length; i++) {
      if (selectedAnswers[i] === undefined) {
        alert(`Please answer Question ${i + 1} before submitting.`);
        return;
      }
      answersArray.push(selectedAnswers[i]);
    }

    setSubmitting(true);
    try {
      const ack = await api.acknowledgeHandover(handoverId, answersArray, comments);
      setReceipt(ack);
    } catch (err: any) {
      alert("Acknowledgement submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading comprehension quiz...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Return Link */}
      <Link
        href="/dashboard/handovers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Handovers
      </Link>

      {/* Main Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Successor Comprehension Check</h1>
            <p className="text-xs text-slate-400">
              Interactive verification of critical project decisions, blockers, and calibration steps before digital sign-off.
            </p>
          </div>
        </div>
      </div>

      {receipt ? (
        /* Digital Receipt Modal / Card */
        <div className="bg-slate-900 p-8 rounded-2xl border-2 border-emerald-500/80 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Handover Formally Acknowledged</h2>
            <p className="text-xs text-slate-400">
              Cryptographically timestamped receipt committed to immutable audit trail.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Comprehension Score:</span>
              <span className="font-bold text-emerald-400 text-sm">{receipt.quiz_score}% (PASSED)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Timestamp:</span>
              <span className="font-mono text-slate-300">{new Date(receipt.signed_at).toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">Digital SHA256 Receipt Hash:</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                {receipt.receipt_hash}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/dashboard/handovers"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors shadow-xs"
            >
              Return to Project Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Quiz Questions */
        <div className="space-y-6">
          {checks.map((check, qIdx) => (
            <div key={check.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Question {qIdx + 1} of {checks.length}
                </span>
                <h3 className="font-bold text-white text-sm">{check.question}</h3>
              </div>

              <div className="space-y-2">
                {check.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(qIdx, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-950/70 border-blue-500 text-white font-semibold shadow-xs"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-slate-700"}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Successor Notes / Error Reporting */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-200 block">
              Successor Notes & Discrepancy Reporting (Optional)
            </label>
            <p className="text-[11px] text-slate-400">
              Notice any discrepancies in the claims? Report them here to trigger a reviewable re-revision.
            </p>
            <textarea
              rows={3}
              placeholder="e.g., 'I will verify the LiDAR extrinsic matrix during tomorrow's chassis assembly...'"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Submit Sign-off */}
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? "Signing Receipt..." : "Submit Comprehension Check & Sign Receipt"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

