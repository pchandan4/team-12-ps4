"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AdminTicketModal from "@/components/admin/AdminTicketModal";
import type { TicketRecord, TicketStatus } from "@/lib/helpdesk";
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Ticket,
  User,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    setLoading(true);
    setError("");
    try {
      const authRes = await fetch("/api/admin/auth");
      const authData = await authRes.json();
      setIsAdmin(Boolean(authData.isAdmin));

      if (authData.isAdmin) {
        await fetchAdminTickets();
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdminTickets() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tickets");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load tickets");
      }
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading admin tickets");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdmin(true);
        setPasscode("");
        await fetchAdminTickets();
      } else {
        setLoginError(data.error || "Incorrect admin passcode");
      }
    } catch {
      setLoginError("Failed to authenticate as administrator");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleQuickStatusChange(ticketId: number, nextStatus: TicketStatus) {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchAdminTickets();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Error updating status");
    }
  }

  // Filter tickets by search term
  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.employee_id.toLowerCase().includes(term) ||
      (t.employees?.name && t.employees.name.toLowerCase().includes(term)) ||
      String(t.id).includes(term) ||
      t.category.toLowerCase().includes(term)
    );
  });

  // Categorize into the 3 primary CampusBite sections
  const openTickets = filteredTickets.filter(
    (t) => t.status === "open" || t.status === "waiting_for_user"
  );
  const inProgressTickets = filteredTickets.filter((t) => t.status === "in_progress");
  const resolvedTickets = filteredTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  );

  // Critical P1 tickets
  const p1CriticalTickets = filteredTickets.filter((t) => t.priority === "P1");

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                IT Operations & Triage
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Kitchen-Screen Pattern</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-0.5 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} />
              <span>IT Admin Board</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Live enterprise ticket management, triage routing, and status transitions across Zentrix Software.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminTickets}
              disabled={loading || !isAdmin}
              className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Board</span>
            </button>
          </div>
        </div>

        {/* If Not Authorized as Admin, Show Admin Login Box */}
        {isAdmin === false && (
          <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Administrator Access Required</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              This board is restricted to authorized IT administrators to manage tickets, update statuses, and reassign support teams.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Enter Administrator Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loginLoading || !passcode}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {loginLoading ? "Authenticating..." : "Unlock IT Admin Board"}
              </button>
            </form>
          </div>
        )}

        {/* Admin Board View */}
        {isAdmin && (
          <>
            {/* Search Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tickets by ID, employee name, subject, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total Live Tickets: <strong className="text-slate-800">{tickets.length}</strong>
              </div>
            </div>

            {/* Prominent P1 Critical Incident Alert Section */}
            {p1CriticalTickets.length > 0 && (
              <div className="bg-red-50/90 border-2 border-red-300 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                    <ShieldAlert size={18} className="text-red-600 animate-pulse" />
                    <span>CRITICAL P1 TICKETS ({p1CriticalTickets.length})</span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase font-mono">
                      SLA: 1 Hr Response / 4 Hr Resolution
                    </span>
                  </div>
                  <span className="text-xs text-red-700 font-medium">Requires Immediate Triage</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {p1CriticalTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="bg-white p-3.5 rounded-lg border border-red-300 shadow-xs hover:border-red-500 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 text-sm">Ticket #{t.id}</span>
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                        <span>By: {t.employees?.name || t.employee_id}</span>
                        <span className="font-medium text-red-700">{t.support_teams?.name || t.team_id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Primary Columns Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1: OPEN TICKETS */}
              <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h2 className="font-bold text-slate-800 text-sm">OPEN TICKETS</h2>
                  </div>
                  <span className="text-xs bg-white text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {openTickets.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {openTickets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No open tickets awaiting triage.
                    </div>
                  ) : (
                    openTickets.map((t) => (
                      <AdminTicketCard
                        key={t.id}
                        ticket={t}
                        onSelect={() => setSelectedTicket(t)}
                        onMove={(st) => handleQuickStatusChange(t.id, st)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: IN PROGRESS */}
              <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h2 className="font-bold text-slate-800 text-sm">IN PROGRESS</h2>
                  </div>
                  <span className="text-xs bg-white text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {inProgressTickets.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {inProgressTickets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No tickets currently in progress.
                    </div>
                  ) : (
                    inProgressTickets.map((t) => (
                      <AdminTicketCard
                        key={t.id}
                        ticket={t}
                        onSelect={() => setSelectedTicket(t)}
                        onMove={(st) => handleQuickStatusChange(t.id, st)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: RESOLVED / CLOSED */}
              <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h2 className="font-bold text-slate-800 text-sm">RESOLVED / CLOSED</h2>
                  </div>
                  <span className="text-xs bg-white text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {resolvedTickets.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {resolvedTickets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No resolved tickets yet.
                    </div>
                  ) : (
                    resolvedTickets.map((t) => (
                      <AdminTicketCard
                        key={t.id}
                        ticket={t}
                        onSelect={() => setSelectedTicket(t)}
                        onMove={(st) => handleQuickStatusChange(t.id, st)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin Ticket Edit Modal */}
      <AdminTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdated={fetchAdminTickets}
      />
    </AppLayout>
  );
}

function AdminTicketCard({
  ticket,
  onSelect,
  onMove,
}: {
  ticket: TicketRecord;
  onSelect: () => void;
  onMove: (st: TicketStatus) => void;
}) {
  const priorityColors: Record<string, string> = {
    P1: "bg-red-100 text-red-800 border-red-300",
    P2: "bg-amber-100 text-amber-800 border-amber-300",
    P3: "bg-blue-100 text-blue-800 border-blue-300",
    P4: "bg-slate-100 text-slate-800 border-slate-300",
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-900 text-xs">#{ticket.id}</span>
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              priorityColors[ticket.priority] || "bg-slate-100"
            }`}
          >
            {ticket.priority}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
            {ticket.category}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          {new Date(ticket.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">{ticket.title}</h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate max-w-[120px]">
          By: <strong className="text-slate-700">{ticket.employees?.name || ticket.employee_id}</strong>
        </span>
        <span className="font-medium text-blue-700 truncate max-w-[130px]">
          {ticket.support_teams?.name || ticket.team_id}
        </span>
      </div>

      {/* Quick Status Action Buttons */}
      <div className="pt-1 flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
        {ticket.status === "open" && (
          <button
            onClick={() => onMove("in_progress")}
            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[10px] font-medium border border-amber-200 transition-colors"
          >
            Start Work →
          </button>
        )}
        {ticket.status === "in_progress" && (
          <button
            onClick={() => onMove("resolved")}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-medium border border-emerald-200 transition-colors"
          >
            Mark Resolved ✓
          </button>
        )}
        {ticket.status === "resolved" && (
          <button
            onClick={() => onMove("closed")}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium transition-colors"
          >
            Close Ticket
          </button>
        )}
        <button
          onClick={onSelect}
          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

