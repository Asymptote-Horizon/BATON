"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";
import { ShieldCheck, Lock, Mail, User, ArrowRight, Shield, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

type AuthTab = "signin" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("signin");

  // Sign In fields
  const [email, setEmail] = useState("admin@baton.local");
  const [password, setPassword] = useState("AdminPass123!");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("successor");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.register(regName, regEmail, regPassword, regRole);
      setSuccessMsg("Account created successfully! You can now sign in.");
      setTab("signin");
      setEmail(regEmail);
      setPassword(regPassword);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSuccess(res.message || "If the email exists, a password reset link has been dispatched.");
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await api.switchRole(role);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Quick login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-2xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl text-white tracking-tight block">BATON</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Project Continuity</span>
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2">
          Sign In to Your Workspace
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Pass the project, not just the files. Evidence-linked handover platform.
        </p>
      </div>

      <div className="relative mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-xl py-7 px-6 shadow-2xl rounded-2xl sm:px-8 border border-slate-800">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setTab("signin"); setError(null); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
                tab === "signin"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setError(null); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
                tab === "register"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setTab("forgot"); setError(null); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
                tab === "forgot"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Reset Key
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form: Sign In */}
          {tab === "signin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setTab("forgot")}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Workspace"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form: Register */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password (8+ chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Assigned Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="successor">Successor (Receives Handover)</option>
                  <option value="leaver">Leaver (Project Owner Exiting)</option>
                  <option value="reviewer">Reviewer (Audits & Verifies Claims)</option>
                  <option value="restricted_viewer">Restricted Viewer (Public Only)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1.5 block">
                  Admin roles are strictly provisioned by existing Organization Administrators.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Form: Forgot Password */}
          {tab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your verified email address to dispatch an authenticated, single-use password reset key.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                  {forgotSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                {loading ? "Dispatching..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>One-Click Evaluation Personas</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="p-2.5 border border-purple-800/60 bg-purple-950/30 hover:bg-purple-900/40 rounded-xl text-left text-xs transition-colors group cursor-pointer"
              >
                <div className="font-bold text-purple-300 group-hover:text-purple-200">Admin</div>
                <div className="text-[10px] text-purple-400/80">Sarah Chen (Full Access)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("leaver")}
                className="p-2.5 border border-amber-800/60 bg-amber-950/30 hover:bg-amber-900/40 rounded-xl text-left text-xs transition-colors group cursor-pointer"
              >
                <div className="font-bold text-amber-300 group-hover:text-amber-200">Leaver</div>
                <div className="text-[10px] text-amber-400/80">Alex Mercer (Outgoing)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("reviewer")}
                className="p-2.5 border border-blue-800/60 bg-blue-950/30 hover:bg-blue-900/40 rounded-xl text-left text-xs transition-colors group cursor-pointer"
              >
                <div className="font-bold text-blue-300 group-hover:text-blue-200">Reviewer</div>
                <div className="text-[10px] text-blue-400/80">Elena Rostova (Tech Lead)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("successor")}
                className="p-2.5 border border-emerald-800/60 bg-emerald-950/30 hover:bg-emerald-900/40 rounded-xl text-left text-xs transition-colors group cursor-pointer"
              >
                <div className="font-bold text-emerald-300 group-hover:text-emerald-200">Successor</div>
                <div className="text-[10px] text-emerald-400/80">Sam Taylor (Onboarding)</div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleQuickLogin("restricted_viewer")}
              className="w-full p-2.5 border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 rounded-xl text-center text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              Restricted Viewer (Jordan Lee • Public Clearance Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
