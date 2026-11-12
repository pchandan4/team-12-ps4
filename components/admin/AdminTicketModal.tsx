"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  Ticket,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
} from "lucide-react";
import type { TicketRecord, TicketStatus } from "@/lib/helpdesk";

interface AdminTicketModalProps {
  ticket: TicketRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

const SUPPORT_TEAMS = [
  { id: "T1", name: "Network & VPN" },
  { id: "T2", name: "Accounts & Access" },
  { id: "T3", name: "Hardware" },
  { id: "T4", name: "Software & Apps" },
  { id: "T5", name: "Security" },
];

export default function AdminTicketModal({
  ticket,
  onClose,
  onUpdated,
}: AdminTicketModalProps) {
  if (!ticket) return null;

  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [teamId, setTeamId] = useState<string>(ticket.team_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["open", "in_progress", "waiting_for_user", "resolved", "closed"],
    in_progress: ["in_progress", "waiting_for_user", "resolved", "closed", "open"],
    waiting_for_user: ["waiting_for_user", "in_progress", "resolved", "closed"],
    resolved: ["resolved", "closed", "in_progress"],
    closed: ["closed", "in_progress", "open"],
  };

  const availableStatuses = allowedTransitions[ticket.status] || ["open", "in_progress", "resolved"];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/tickets/${ticket!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          team_id: teamId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update ticket");
      }

      setSuccess("Ticket updated successfully!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving ticket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm md:text-base">
                  Manage Ticket #{ticket.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    ticket.priority === "P1"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Submitted by {ticket.employees?.name || ticket.employee_id} · {ticket.employees?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Ticket Subject & Description Readonly */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Issue Subject
            </label>
            <p className="text-sm font-semibold text-slate-800">{ticket.title}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Issue Description
            </label>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {/* Admin Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {availableStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assigned Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {SUPPORT_TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

