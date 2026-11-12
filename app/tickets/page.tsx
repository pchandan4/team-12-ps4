"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import TicketDetailModal from "@/components/tickets/TicketDetailModal";
import type { TicketRecord } from "@/lib/helpdesk";
import {
  Ticket,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Bot,
} from "lucide-react";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load tickets");
      }
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching tickets");
    } finally {
      setLoading(false);
    }
  }

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search);

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    p1: tickets.filter((t) => t.priority === "P1").length,
  };

  const priorityBadgeStyle: Record<string, string> = {
    P1: "bg-red-100 text-red-800 border-red-200",
    P2: "bg-amber-100 text-amber-800 border-amber-200",
    P3: "bg-blue-100 text-blue-800 border-blue-200",
    P4: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const statusBadgeStyle: Record<string, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    waiting_for_user: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl w-full mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              My Support Tickets
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Track and monitor the status of tickets filed for employee Karthik S (E101).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              href="/chat"
              className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Bot size={15} />
              <span>Ask DeskBot</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500">Total Tickets</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{counts.total}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-blue-600 font-medium">Open</span>
            <p className="text-xl font-bold text-blue-700 mt-1">{counts.open}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-amber-600 font-medium">In Progress</span>
            <p className="text-xl font-bold text-amber-700 mt-1">{counts.in_progress}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-emerald-600 font-medium">Resolved / Closed</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{counts.resolved}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 (Critical)</option>
              <option value="P2">P2 (High)</option>
              <option value="P3">P3 (Medium)</option>
              <option value="P4">P4 (Low)</option>
            </select>
          </div>
        </div>

        {/* Ticket List View */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading your tickets from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <Ticket size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-800">No tickets found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all" || priorityFilter !== "all"
                ? "No tickets match your active filter criteria."
                : "You do not have any open or past tickets. Ask DeskBot if you need technical support."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assigned Team</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedTicket(t)}
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900">#{t.id}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {t.description}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold border ${
                            priorityBadgeStyle[t.priority] || "bg-slate-100"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {t.support_teams?.name || t.team_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold border ${
                            statusBadgeStyle[t.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(t);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </AppLayout>
  );
}

