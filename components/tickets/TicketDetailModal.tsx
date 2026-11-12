"use client";

import {
  X,
  Ticket,
  Clock,
  User,
  Shield,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { TicketRecord } from "@/lib/helpdesk";

interface TicketDetailModalProps {
  ticket: TicketRecord | null;
  onClose: () => void;
}

export default function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  if (!ticket) return null;

  const priorityColors: Record<string, string> = {
    P1: "bg-red-100 text-red-800 border-red-300",
    P2: "bg-amber-100 text-amber-800 border-amber-300",
    P3: "bg-blue-100 text-blue-800 border-blue-300",
    P4: "bg-slate-100 text-slate-800 border-slate-300",
  };

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-amber-100 text-amber-800 border-amber-200",
    waiting_for_user: "bg-purple-100 text-purple-800 border-purple-200",
    resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const slaMeanings: Record<string, { desc: string; response: string; resolve: string }> = {
    P1: { desc: "Many users blocked or security issue", response: "1 hour", resolve: "4 hours" },
    P2: { desc: "One user fully blocked from work", response: "4 hours", resolve: "8 hours" },
    P3: { desc: "Work is slowed down but continuing", response: "8 hours", resolve: "24 hours" },
    P4: { desc: "General IT request or inquiry", response: "24 hours", resolve: "72 hours" },
  };

  const sla = slaMeanings[ticket.priority] || slaMeanings.P3;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">Ticket #{ticket.id}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    statusColors[ticket.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${
                    priorityColors[ticket.priority] || "bg-slate-100"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Category: <strong className="text-slate-700">{ticket.category}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Title & Description */}
          <div>
            <h3 className="text-base font-semibold text-slate-900">{ticket.title}</h3>
            <p className="text-xs md:text-sm text-slate-600 mt-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* SLA Rule Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-blue-700" />
                SLA Rule Policy: {ticket.priority}
              </span>
              <span className="text-[11px] text-blue-700">Target Response: {sla.response}</span>
            </div>
            <p className="text-blue-800 text-[11px]">{sla.desc}</p>
            <p className="text-[11px] text-blue-600 font-medium pt-1">
              Guaranteed Resolution Target: {sla.resolve}
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                Assigned Team
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block text-sm">
                {ticket.support_teams?.name || ticket.team_id}
              </span>
              {ticket.support_teams?.handles && (
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Handles: {ticket.support_teams.handles}
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                Employee
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block text-sm">
                {ticket.employee_id}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Authorized submitter
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                Created At
              </span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                Last Updated
              </span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {new Date(ticket.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

