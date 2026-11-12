"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentResult, AgentStep } from "@/lib/agent/types";
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  Ticket,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  CURRENT_EMPLOYEE_ID,
  CURRENT_EMPLOYEE_NAME,
} from "@/lib/helpdesk";

type Message = {
  role: "user" | "model";
  text: string;
  steps?: AgentStep[];
  timestamp?: string;
};

const SAMPLE_PROMPTS = [
  "My VPN keeps disconnecting since morning.",
  "I cannot connect to the office Wi-Fi.",
  "I clicked a strange link in an email.",
  "My laptop is running very slowly.",
  "How can I reset my password?",
  "What is the status of my laptop ticket?",
];

export default function AgentChat({ onDataChanged }: { onDataChanged?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hello ${CURRENT_EMPLOYEE_NAME}! I'm DeskBot, your IT Helpdesk Assistant. How can I help you today?\n\nYou can describe any technical issue with VPN, Wi-Fi, hardware, software, passwords, or report security incidents. I can search our IT knowledge base, guide you through troubleshooting, or raise a ticket directly with the appropriate support team.`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, currentToolStatus]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const next: Message[] = [...messages, { role: "user", text: trimmed, timestamp: timeStr }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    setCurrentToolStatus("DeskBot is analyzing your request...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.role === "user" || m.role === "model")
            .slice(-20)
            .map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to contact agent service");
      const result = data as AgentResult;

      setMessages([
        ...next,
        {
          role: "model",
          text: result.reply,
          steps: result.steps,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (result.steps.some((s) => s.writes && s.ok)) {
        onDataChanged?.();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
      setCurrentToolStatus(null);
    }
  }

  function handlePromptClick(prompt: string) {
    send(prompt);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-[#FFFFFF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900 text-sm md:text-base">DeskBot IT Assistant</h2>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Agent
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Autonomous IT Support & Ticket Management · Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
          <User size={13} className="text-slate-400" />
          <span>
            Logged in as <strong className="text-slate-800">{CURRENT_EMPLOYEE_NAME}</strong> ({CURRENT_EMPLOYEE_ID})
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#F7F8FA]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "model" && (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[88%] md:max-w-[78%] space-y-2.5 ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Tool Execution Steps Card (CampusBite style) */}
              {m.steps && m.steps.length > 0 && <ToolExecutionList steps={m.steps} />}

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-xl text-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-[#2563EB] text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.timestamp && (
                  <div
                    className={`mt-2 text-[10px] flex justify-end ${
                      m.role === "user" ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                )}
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-[#17243A] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Live Loading & Tool Activity Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl rounded-tl-none shadow-xs text-xs text-slate-700 flex items-center gap-3">
              <RefreshCw size={15} className="animate-spin text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  {currentToolStatus || "DeskBot is reasoning..."}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Analyzing schema, SLA rules and knowledge base articles
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles size={12} className="text-blue-600" /> Try:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your IT issue, ask for troubleshooting steps, or track a ticket..."
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
        >
          <span>Send</span>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

/**
 * Visual CampusBite-style Tool Activity List
 * Clearly indicates [READ] vs [WRITE], status, parameters and results.
 */
function ToolExecutionList({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, idx) => (
        <ToolCard key={idx} step={step} />
      ))}
    </div>
  );
}

function ToolCard({ step }: { step: AgentStep }) {
  const [expanded, setExpanded] = useState(false);

  // Friendly tool descriptions
  const toolLabels: Record<string, string> = {
    searchKnowledgeBase: "Searching IT Knowledge Base",
    getMyTickets: "Retrieving Your Support Tickets",
    getTicketStatus: "Looking Up Ticket Details",
    createTicket: "Creating Official Support Ticket",
    updateTicket: "Updating Ticket Record (Admin)",
  };

  const isWrite = step.writes;
  const label = toolLabels[step.tool] || step.tool;

  // Type assertion helpers
  const res = (step.result || {}) as Record<string, unknown>;
  const kbArticles = Array.isArray(res.articles)
    ? (res.articles as Array<{ id: number; title: string; category: string; solution_steps: string; support_team: string }>)
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Tool Header Summary */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between transition-colors text-xs"
      >
        <div className="flex items-center gap-2">
          {isWrite ? (
            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
              [WRITE]
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-300">
              [READ]
            </span>
          )}

          <span className="font-semibold text-slate-800">{label}</span>
          <span className="font-mono text-slate-400 text-[11px]">({step.tool})</span>
        </div>

        <div className="flex items-center gap-2">
          {step.ok ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 size={12} /> Success
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <AlertCircle size={12} /> Failed
            </span>
          )}
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {/* Structured Tool Result Cards */}
      {Boolean(step.ok && step.tool === "searchKnowledgeBase" && res.found && kbArticles.length > 0) && (
        <div className="p-3 bg-blue-50/40 border-t border-slate-200 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 flex items-center gap-1">
            <BookOpen size={12} /> Knowledge Base Matches ({kbArticles.length})
          </p>
          {kbArticles.map((art) => (
            <div key={art.id} className="bg-white p-3 rounded-lg border border-blue-200 text-xs shadow-2xs">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>{art.title}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {art.category} · {art.support_team}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] whitespace-pre-line pl-2 border-l-2 border-blue-400">
                  {art.solution_steps}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Ticket Creation Card */}
      {Boolean(step.ok && step.tool === "createTicket" && res.ticket_id) && (
        <div className="p-3 bg-emerald-50/50 border-t border-emerald-200">
          <div className="bg-white p-3.5 rounded-lg border border-emerald-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Ticket #{String(res.ticket_id)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    res.priority === "P1"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : res.priority === "P2"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-blue-100 text-blue-800 border border-blue-300"
                  }`}
                >
                  {String(res.priority)}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                  {String(res.status).toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Team: <strong className="text-slate-700">{String(res.assigned_team)}</strong>
              </span>
            </div>
            <p className="text-xs font-medium text-slate-800">{String(res.subject)}</p>
            <p className="text-[11px] text-emerald-700">{String(res.message)}</p>
          </div>
        </div>
      )}

      {/* Ticket Status Retrieval Card */}
      {Boolean(step.ok && step.tool === "getTicketStatus" && res.id) && (
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Ticket #{String(res.id)}</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                Status: {String(res.status).toUpperCase()}
              </span>
            </div>
            <p className="text-slate-700 font-medium">{String(res.subject)}</p>
            <p className="text-[11px] text-slate-500">
              Priority: <strong className="text-slate-700">{String(res.priority)}</strong> · Assigned Team:{" "}
              <strong className="text-slate-700">{String(res.assigned_team)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Expanded JSON Inspector for Faculty & Judges */}
      {expanded && (
        <div className="p-3 border-t border-slate-200 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto space-y-2">
          <div>
            <span className="text-slate-400">// Tool Arguments:</span>
            <pre className="text-emerald-400 mt-1 whitespace-pre-wrap">
              {JSON.stringify(step.args, null, 2)}
            </pre>
          </div>
          <div>
            <span className="text-slate-400">// Server Output:</span>
            <pre
              className={`mt-1 whitespace-pre-wrap ${
                step.ok ? "text-cyan-300" : "text-red-400"
              }`}
            >
              {JSON.stringify(step.ok ? step.result : { error: step.error }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
