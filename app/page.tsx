"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import TicketDetailModal from "@/components/tickets/TicketDetailModal";
import type { TicketRecord } from "@/lib/helpdesk";
import {
  CURRENT_EMPLOYEE_ID,
  CURRENT_EMPLOYEE_NAME,
  CURRENT_EMPLOYEE_DEPT,
  CURRENT_EMPLOYEE_LOCATION,
  CURRENT_EMPLOYEE_LAPTOP,
} from "@/lib/helpdesk";
import {
  Bot,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Laptop,
  Wifi,
  Lock,
  LifeBuoy,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load dashboard data");
      }
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  }

  // Calculate live database statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    p1Critical: tickets.filter((t) => t.priority === "P1").length,
  };

  const recentTickets = tickets.slice(0, 5);

  const priorityColors: Record<string, string> = {
    P1: "bg-red-100 text-red-800 border-red-200",
    P2: "bg-amber-100 text-amber-800 border-amber-200",
    P3: "bg-blue-100 text-blue-800 border-blue-200",
    P4: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const statusColors: Record<string, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    waiting_for_user: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Welcome Greeting & Employee Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                IT Service Portal
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Zentrix Software</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Welcome back, {CURRENT_EMPLOYEE_NAME}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Employee ID: <strong className="text-slate-700">{CURRENT_EMPLOYEE_ID}</strong> · Department:{" "}
              <strong className="text-slate-700">{CURRENT_EMPLOYEE_DEPT}</strong> · Location:{" "}
              <strong className="text-slate-700">{CURRENT_EMPLOYEE_LOCATION}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              href="/chat"
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Bot size={16} />
              <span>Ask DeskBot</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid (from real Supabase database) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Total Tickets</span>
              <Ticket size={16} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Assigned to E101</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-xs font-medium">Open</span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.open}</p>
            <span className="text-[11px] text-blue-500/80 mt-1 block">Awaiting triage</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-medium">In Progress</span>
              <Activity size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2">{stats.inProgress}</p>
            <span className="text-[11px] text-amber-500/80 mt-1 block">Being resolved</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-medium">Resolved</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.resolved}</p>
            <span className="text-[11px] text-emerald-600/80 mt-1 block">Completed issues</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-red-600">
              <span className="text-xs font-medium">Critical P1</span>
              <ShieldAlert size={16} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">{stats.p1Critical}</p>
            <span className="text-[11px] text-red-500/80 mt-1 block">Urgent escalation</span>
          </div>
        </div>

        {/* Quick Actions & Common Problems */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-r from-[#17243A] to-[#1e3252] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium mb-2 border border-blue-400/30">
                <Bot size={13} />
                <span>Agentic IT Helpdesk</span>
              </div>
              <h2 className="text-lg font-bold">Have an IT problem? DeskBot can help.</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                DeskBot uses Gemini Function Calling to search company troubleshooting manuals, verify SLA targets, and autonomously raise support tickets directly into Supabase.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
              <Link
                href="/chat"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Open Helpdesk Chat</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/tickets"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                View My Tickets ({stats.total})
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Workstation
            </h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <Laptop size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{CURRENT_EMPLOYEE_LAPTOP}</p>
                <p className="text-[11px] text-slate-500">Zentrix Corporate Build</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">OS Security Patch:</span>
                <span className="font-medium text-emerald-700">Compliant</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Primary Support:</span>
                <span className="font-medium text-slate-800">Hardware (T3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ticket Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-slate-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Recent Ticket Activity</h2>
            </div>
            <Link
              href="/tickets"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>See all ({tickets.length})</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <RefreshCw size={20} className="animate-spin text-blue-600 mx-auto mb-2" />
              Loading real database records...
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">No tickets found for E101</p>
              <p>When you raise an issue with DeskBot, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs">#{t.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                          priorityColors[t.priority] || "bg-slate-100"
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                          statusColors[t.status] || "bg-slate-100"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Team: {t.support_teams?.name || t.team_id}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                    <button className="text-[11px] text-blue-600 hover:underline mt-1 font-medium">
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </AppLayout>
  );
}
