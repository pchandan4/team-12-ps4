export const CURRENT_EMPLOYEE_ID = "E101";
export const CURRENT_EMPLOYEE_NAME = "Karthik S";
export const CURRENT_EMPLOYEE_DEPT = "Engineering";
export const CURRENT_EMPLOYEE_LOCATION = "Chennai";
export const CURRENT_EMPLOYEE_LAPTOP = "ThinkBook 14 G5";

export type TicketPriority = "P1" | "P2" | "P3" | "P4";
export type TicketStatus = "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  location: string;
  laptop_model: string | null;
}

export interface SupportTeamRecord {
  id: string;
  name: string;
  handles: string;
}

export interface SlaRuleRecord {
  priority: TicketPriority;
  meaning: string;
  response_hours: number;
  resolve_hours: number;
}

export interface KbArticleRecord {
  id: number;
  title: string;
  category: string;
  keywords: string;
  solution_steps: string;
  team_id: string;
}

export interface TicketRecord {
  id: number;
  employee_id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  team_id: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  support_teams?: {
    name: string;
    handles?: string;
  };
  employees?: {
    name: string;
    email: string;
    department: string;
  };
}

/**
 * Maps category and issue keywords to the accurate support team ID
 * based on the database seed records in support_teams.
 */
export function resolveTeamId(category: string, subject: string, description: string): string {
  const text = `${category} ${subject} ${description}`.toLowerCase();

  // T5: Security
  if (
    text.includes("security") ||
    text.includes("phishing") ||
    text.includes("suspicious") ||
    text.includes("link") ||
    text.includes("virus") ||
    text.includes("malware") ||
    text.includes("antivirus") ||
    text.includes("stolen") ||
    text.includes("lost laptop") ||
    text.includes("breach") ||
    text.includes("scam") ||
    text.includes("usb blocked")
  ) {
    return "T5";
  }

  // T1: Network & VPN
  if (
    text.includes("vpn") ||
    text.includes("wi-fi") ||
    text.includes("wifi") ||
    text.includes("internet") ||
    text.includes("network") ||
    text.includes("shared drive") ||
    text.includes("remote access") ||
    text.includes("git") ||
    text.includes("github")
  ) {
    return "T1";
  }

  // T2: Accounts & Access
  if (
    text.includes("password") ||
    text.includes("account") ||
    text.includes("lock") ||
    text.includes("mfa") ||
    text.includes("authenticator") ||
    text.includes("access") ||
    text.includes("permission") ||
    text.includes("license") ||
    text.includes("jira")
  ) {
    return "T2";
  }

  // T3: Hardware
  if (
    text.includes("hardware") ||
    text.includes("laptop") ||
    text.includes("battery") ||
    text.includes("charge") ||
    text.includes("charger") ||
    text.includes("monitor") ||
    text.includes("screen") ||
    text.includes("display") ||
    text.includes("keyboard") ||
    text.includes("mouse") ||
    text.includes("printer") ||
    text.includes("dock") ||
    text.includes("blue screen") ||
    text.includes("bsod") ||
    text.includes("disk space")
  ) {
    return "T3";
  }

  // T4: Software & Apps
  if (
    text.includes("software") ||
    text.includes("app") ||
    text.includes("office") ||
    text.includes("teams") ||
    text.includes("outlook") ||
    text.includes("excel") ||
    text.includes("ide") ||
    text.includes("vscode") ||
    text.includes("crash") ||
    text.includes("install") ||
    text.includes("portal")
  ) {
    return "T4";
  }

  // Category fallback
  switch (category.toLowerCase()) {
    case "vpn":
    case "network":
      return "T1";
    case "account":
    case "access":
      return "T2";
    case "hardware":
      return "T3";
    case "software":
    case "apps":
    case "email":
      return "T4";
    case "security":
      return "T5";
    default:
      return "T4";
  }
}

/**
 * Maps urgency/impact to priority according to sla_rules:
 * P1: Many users blocked OR security issue (1h response, 4h resolve)
 * P2: One user fully blocked (4h response, 8h resolve)
 * P3: Work is slowed down (8h response, 24h resolve)
 * P4: A request or question (24h response, 72h resolve)
 */
export function resolvePriority(
  explicitPriority?: string,
  impactDescription?: string,
  isSecurity = false
): TicketPriority {
  if (explicitPriority && ["P1", "P2", "P3", "P4"].includes(explicitPriority.toUpperCase())) {
    return explicitPriority.toUpperCase() as TicketPriority;
  }

  if (isSecurity) return "P1";

  const impact = (impactDescription || "").toLowerCase();
  if (
    impact.includes("many users") ||
    impact.includes("whole office") ||
    impact.includes("all users") ||
    impact.includes("security") ||
    impact.includes("phishing") ||
    impact.includes("critical")
  ) {
    return "P1";
  }

  if (
    impact.includes("fully blocked") ||
    impact.includes("cannot work") ||
    impact.includes("blocked") ||
    impact.includes("unable to work") ||
    impact.includes("urgent")
  ) {
    return "P2";
  }

  if (
    impact.includes("request") ||
    impact.includes("question") ||
    impact.includes("access") ||
    impact.includes("license") ||
    impact.includes("new laptop")
  ) {
    return "P4";
  }

  // Default priority for troubleshooting issues
  return "P3";
}

/**
 * Validates allowed status transitions for ticket state machine.
 */
export function isValidStatusTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["in_progress", "waiting_for_user", "resolved", "closed"],
    in_progress: ["waiting_for_user", "resolved", "closed", "open"],
    waiting_for_user: ["in_progress", "resolved", "closed"],
    resolved: ["closed", "in_progress"],
    closed: ["in_progress", "open"],
  };
  return allowedTransitions[from]?.includes(to) ?? false;
}
