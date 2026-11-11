"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AuditLog } from "@/lib/types";
import { 
  History, 
  ShieldCheck, 
  User, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Search,
  Filter
} from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getProjects().then((projs) => {
      const pid = projs[0]?.id;
      if (pid) {
        api.getAuditLogs(pid).then((data) => {
          setLogs(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const filteredLogs = logs.filter((l) => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Append-Only Audit Log</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographically grounded historical record of every human approval, redaction event, claim review, and digital acknowledgement.
        </p>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audit actions, actors, or targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {filteredLogs.length} verified audit records
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit trail...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit records match the query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Audit Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors text-xs">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-blue-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user_name}</span>
                      </div>
                    </td>

                    {/* Target Type */}
                    <td className="py-3 px-4 whitespace-nowrap capitalize text-slate-300">
                      {log.target_type}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

