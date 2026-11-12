"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Ticket,
  ShieldCheck,
  LogOut,
  User,
  Laptop,
  Menu,
  X,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  CURRENT_EMPLOYEE_ID,
  CURRENT_EMPLOYEE_NAME,
  CURRENT_EMPLOYEE_DEPT,
  CURRENT_EMPLOYEE_LOCATION,
  CURRENT_EMPLOYEE_LAPTOP,
} from "@/lib/helpdesk";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: adminPasscode }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdmin(true);
        setShowAdminModal(false);
        setAdminPasscode("");
      } else {
        setAdminError(data.error || "Incorrect admin passcode");
      }
    } catch {
      setAdminError("Failed to authenticate admin");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleAdminLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAdmin(false);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Helpdesk Assistant",
      href: "/chat",
      icon: Bot,
      active: pathname === "/chat",
      badge: "AI",
    },
    {
      name: "My Tickets",
      href: "/tickets",
      icon: Ticket,
      active: pathname === "/tickets",
    },
    {
      name: "IT Admin Board",
      href: "/admin",
      icon: ShieldCheck,
      active: pathname === "/admin",
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row text-[#1E293B]">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#17243A] text-white p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            DB
          </div>
          <span className="font-semibold text-lg tracking-tight">DeskBot</span>
          <span className="text-xs bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/30">
            PS4
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col w-full md:w-64 bg-[#17243A] text-slate-300 shrink-0 border-r border-slate-800 z-30`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-base shadow-sm">
              DB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-tight text-base">DeskBot</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-800">
                  PS4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zentrix IT Services</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={item.active ? "text-white" : "text-slate-400"} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.active ? "bg-white/20 text-white" : "bg-blue-900/60 text-blue-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isAdmin
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isAdmin ? "Active" : "Admin"}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Role & Controls
            </p>
            {isAdmin ? (
              <div className="mx-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                <div className="flex items-center justify-between text-emerald-300 font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Unlock size={14} /> Admin Mode
                  </span>
                  <button
                    onClick={handleAdminLogout}
                    className="text-[11px] text-emerald-400 underline hover:text-emerald-200"
                  >
                    Lock
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Authorized for ticket management.</p>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Lock size={14} className="text-slate-400" /> Enable Admin Mode
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                  IT Admin
                </span>
              </button>
            )}
          </div>
        </nav>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800 bg-[#121c2e]">
          <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate">
                  {CURRENT_EMPLOYEE_NAME}
                </span>
                <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1 py-0.2 rounded font-mono">
                  {CURRENT_EMPLOYEE_ID}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {CURRENT_EMPLOYEE_DEPT} · {CURRENT_EMPLOYEE_LOCATION}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <Laptop size={11} className="text-slate-400" />
                <span className="truncate">{CURRENT_EMPLOYEE_LAPTOP}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>

      {/* Admin Authorization Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-semibold text-base">IT Admin Authorization</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter the IT Administrator passcode to unlock administrative privileges for updating ticket statuses and triage workflows.
            </p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Administrator Passcode
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  autoFocus
                />
              </div>
              {adminError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <AlertCircle size={14} />
                  <span>{adminError}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading || !adminPasscode}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {adminLoading ? "Verifying..." : "Authorize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

