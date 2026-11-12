"use client";

import AppLayout from "@/components/layout/AppLayout";
import AgentChat from "@/components/AgentChat";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 flex-1 flex flex-col max-w-6xl w-full mx-auto">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Helpdesk Assistant
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Interact with DeskBot in natural language to troubleshoot issues, search solutions, or raise and track tickets.
          </p>
        </div>
        <div className="flex-1">
          <AgentChat />
        </div>
      </div>
    </AppLayout>
  );
}

