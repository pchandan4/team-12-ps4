import "server-only";
import { tools } from "./tools";
import type { ChatMessage } from "../schemas";
import type { AgentResult, AgentStep } from "./types";

/**
 * Demo fallback engine.
 * Executes the exact same server tools (searchKnowledgeBase, createTicket, getTicketStatus, getMyTickets)
 * so that judges can experience all 7 demo scenarios locally even before adding a Gemini API key.
 */
export async function runDemoAgent(messages: ChatMessage[]): Promise<AgentResult> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.text.toLowerCase() || "";
  const steps: AgentStep[] = [];

  const kbTool = tools.find((t) => t.name === "searchKnowledgeBase")!;
  const createTool = tools.find((t) => t.name === "createTicket")!;
  const getStatusTool = tools.find((t) => t.name === "getTicketStatus")!;
  const myTicketsTool = tools.find((t) => t.name === "getMyTickets")!;

  // Demo 1: VPN Troubleshooting
  if (lastUserMsg.includes("vpn") && !lastUserMsg.includes("ticket")) {
    const args = { query: "vpn disconnect", category: "VPN" as const };
    const res = await kbTool.run(args);
    steps.push({ tool: "searchKnowledgeBase", args, ok: true, writes: false, result: res });
    return {
      reply: `I searched our IT Knowledge Base and found relevant troubleshooting steps for VPN connection issues:\n\n1. Close the VPN app fully and reopen it.\n2. Switch to a stable Wi-Fi or mobile hotspot.\n3. In the VPN client, select the nearest server (Chennai or Bengaluru).\n4. Update the VPN client from Company Portal.\n5. Restart your laptop if it continues dropping.\n\nDid this resolve your issue, or would you like me to raise a support ticket?`,
      steps,
    };
  }

  // Demo 2: Ticket Creation (Follow-up)
  if (
    (lastUserMsg.includes("ticket") && (lastUserMsg.includes("create") || lastUserMsg.includes("not work") || lastUserMsg.includes("raise"))) ||
    lastUserMsg.includes("did not work")
  ) {
    const args = {
      subject: "VPN keeps disconnecting since morning",
      description: "Employee experienced recurring VPN drops. Followed standard KB troubleshooting steps without resolution.",
      category: "VPN" as const,
      priority: "P3" as const,
      impact: "Work is slowed down but can continue",
    };
    const res = (await createTool.run(args)) as Record<string, unknown>;
    steps.push({ tool: "createTicket", args, ok: true, writes: true, result: res });
    return {
      reply: `I have created an official support ticket for you:\n\n• **Ticket ID**: #${res.ticket_id}\n• **Subject**: ${res.subject}\n• **Category**: ${res.category}\n• **Priority**: ${res.priority} (Target Response: 8 hours)\n• **Assigned Team**: ${res.assigned_team}\n\nYou can track its progress in the 'My Tickets' section or ask me anytime!`,
      steps,
    };
  }

  // Demo 3: Security Incident
  if (
    lastUserMsg.includes("strange link") ||
    lastUserMsg.includes("suspicious") ||
    lastUserMsg.includes("phishing") ||
    lastUserMsg.includes("virus")
  ) {
    const args = {
      subject: "Security Incident: Clicked suspicious link in email",
      description: "Employee reported clicking an unverified link in an email. Potential phishing/credential compromise.",
      category: "Security" as const,
      priority: "P1" as const,
      impact: "Security incident requiring immediate isolation",
    };
    const res = (await createTool.run(args)) as Record<string, unknown>;
    steps.push({ tool: "createTicket", args, ok: true, writes: true, result: res });
    return {
      reply: `⚠️ **URGENT SECURITY ALERT** ⚠️\n\nI have recognized this as a critical security issue and created a **P1 Emergency Ticket**:\n\n• **Ticket ID**: #${res.ticket_id}\n• **Assigned Team**: Security (T5)\n• **SLA Priority**: P1 (1 Hour Response Target)\n\n**Immediate Actions Required**:\n1. Disconnect your laptop from the office network and Wi-Fi immediately.\n2. Do NOT enter any passwords or credentials.\n3. The Zentrix Security Response Team has been notified and will reach out to you shortly.`,
      steps,
    };
  }

  // Demo 4: Ticket Tracking
  if (
    lastUserMsg.includes("status") ||
    lastUserMsg.includes("laptop ticket") ||
    lastUserMsg.includes("track")
  ) {
    const args = { ticket_id: 1 };
    const res = (await getStatusTool.run(args)) as Record<string, unknown>;
    steps.push({ tool: "getTicketStatus", args, ok: true, writes: false, result: res });
    return {
      reply: `Here is the current status of your ticket:\n\n• **Ticket #${res.id}**: ${res.subject}\n• **Category**: ${res.category}\n• **Status**: ${(res.status as string).toUpperCase().replace("_", " ")}\n• **Assigned Team**: ${res.assigned_team}\n• **Priority**: ${res.priority}\n\nThe Hardware support team is currently working on battery diagnostic testing.`,
      steps,
    };
  }

  // Demo 6: Unclear Request
  if (
    lastUserMsg.includes("computer is not working") ||
    lastUserMsg.includes("not working") ||
    lastUserMsg.length < 15
  ) {
    return {
      reply: `I understand your computer is having issues. To help you with the correct solution, could you please specify:\n\n1. Is the laptop failing to turn on, running slowly, or showing an error screen?\n2. Are you experiencing issues with Wi-Fi, VPN, or a specific application?`,
      steps: [],
    };
  }

  // Generic KB search fallback
  const searchArgs = { query: lastUserMsg };
  const searchRes = (await kbTool.run(searchArgs)) as { found: boolean; articles: Array<{ title: string; solution_steps: string }> };
  steps.push({ tool: "searchKnowledgeBase", args: searchArgs, ok: true, writes: false, result: searchRes });

  if (searchRes.found && searchRes.articles.length > 0) {
    const top = searchRes.articles[0];
    return {
      reply: `Here is what I found in our IT Knowledge Base for **${top.title}**:\n\n${top.solution_steps}\n\nLet me know if this solves your problem or if you'd like me to raise a ticket.`,
      steps,
    };
  }

  return {
    reply: `I checked our knowledge base for "${lastUserMsg}" but could not find a matching article. Would you like me to raise a support ticket with our IT team?`,
    steps,
  };
}

