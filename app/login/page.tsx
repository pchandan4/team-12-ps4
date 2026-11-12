"use client";

import { useState } from "react";
import { Bot, Shield, User, Laptop } from "lucide-react";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#F7F8FA] text-[#1E293B]">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Bot size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">DeskBot Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-Powered IT Helpdesk Ticket Agent · Zentrix Software (PS4)
          </p>
        </div>

        {/* Login Box */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Team Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              placeholder="Enter team passcode"
              autoFocus
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Protects your live application and Gemini API quota.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full rounded-lg bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Verifying Session..." : "Enter IT Portal"}
          </button>

          {/* Logged in Employee Info */}
          <div className="pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <User size={13} className="text-blue-600" />
              <span>Demo Session Context</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Authenticated Employee: <strong className="text-slate-800">Karthik S. (E101)</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Department: Engineering · Chennai Office · ThinkBook 14 G5
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
