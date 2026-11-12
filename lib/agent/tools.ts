import "server-only";
import { defineTool, type AgentTool } from "./defineTool";
import { getSupabase } from "../supabase";
import {
  searchKnowledgeBaseSchema,
  getMyTicketsSchema,
  getTicketStatusSchema,
  createTicketSchema,
  updateTicketSchema,
} from "../schemas";
import {
  CURRENT_EMPLOYEE_ID,
  resolveTeamId,
  resolvePriority,
  isValidStatusTransition,
  type TicketStatus,
} from "../helpdesk";
import { isUserAdmin } from "../adminAuth";

/**
 * TOOL 1: searchKnowledgeBase (Read Tool)
 * Searches the IT knowledge base for official troubleshooting solutions.
 */
const searchKnowledgeBase = defineTool({
  name: "searchKnowledgeBase",
  description:
    "Use this when the employee reports an IT problem, error, or technical question and you need to find relevant troubleshooting steps or solutions in the company IT knowledge base. Never invent solutions.",
  schema: searchKnowledgeBaseSchema,
  run: async ({ query, category }) => {
    const supabase = getSupabase();
    let queryBuilder = supabase
      .from("kb_articles")
      .select("id, title, category, keywords, solution_steps, team_id, support_teams(id, name)");

    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    // Split search terms to search broadly across title, keywords, and solution_steps
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    let { data, error } = await queryBuilder;
    if (error) {
      console.error("[searchKnowledgeBase] Supabase error:", error);
      throw new Error(`Database error querying knowledge base: ${error.message}`);
    }

    let articles = data ?? [];

    if (terms.length > 0 && articles.length > 0) {
      // Rank articles by keyword/content relevance
      articles = articles
        .map((art) => {
          let score = 0;
          const fullText = `${art.title} ${art.keywords} ${art.solution_steps} ${art.category}`.toLowerCase();
          for (const term of terms) {
            if (art.title.toLowerCase().includes(term)) score += 5;
            if (art.keywords.toLowerCase().includes(term)) score += 4;
            if (art.category.toLowerCase().includes(term)) score += 3;
            if (fullText.includes(term)) score += 1;
          }
          return { ...art, score };
        })
        .filter((a) => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }

    if (articles.length === 0) {
      return {
        found: false,
        message: `No knowledge base article found matching "${query}". You should ask clarification or offer to create a ticket for the user.`,
        articles: [],
      };
    }

    return {
      found: true,
      count: articles.length,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        solution_steps: a.solution_steps,
        support_team: (a as Record<string, unknown>).support_teams
          ? ((a as Record<string, unknown>).support_teams as { name: string }).name
          : a.team_id,
      })),
    };
  },
});

/**
 * TOOL 2: getMyTickets (Read Tool)
 * Retrieves support tickets belonging strictly to the logged-in employee (E101).
 */
const getMyTickets = defineTool({
  name: "getMyTickets",
  description:
    "Use this when the employee asks to see, list, or check their own IT support tickets. Always retrieves tickets for the authenticated employee E101.",
  schema: getMyTicketsSchema,
  run: async ({ status }) => {
    const supabase = getSupabase();
    let queryBuilder = supabase
      .from("tickets")
      .select("id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(name)")
      .eq("employee_id", CURRENT_EMPLOYEE_ID)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      queryBuilder = queryBuilder.eq("status", status);
    }

    const { data, error } = await queryBuilder;
    if (error) {
      console.error("[getMyTickets] Supabase error:", error);
      throw new Error(`Database error fetching tickets: ${error.message}`);
    }

    const tickets = (data ?? []).map((t) => ({
      id: t.id,
      subject: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assigned_team: (t as Record<string, unknown>).support_teams
        ? ((t as Record<string, unknown>).support_teams as { name: string }).name
        : t.team_id,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return {
      employee_id: CURRENT_EMPLOYEE_ID,
      count: tickets.length,
      tickets,
    };
  },
});

/**
 * TOOL 3: getTicketStatus (Read Tool)
 * Retrieves status and details for a specific ticket, enforcing E101 ownership.
 */
const getTicketStatus = defineTool({
  name: "getTicketStatus",
  description:
    "Use this when the employee asks about the status, progress, or assigned team of a specific ticket using its numeric ticket ID.",
  schema: getTicketStatusSchema,
  run: async ({ ticket_id }) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .select("id, employee_id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(name), employees(name, email)")
      .eq("id", ticket_id)
      .maybeSingle();

    if (error) {
      console.error("[getTicketStatus] Supabase error:", error);
      throw new Error(`Database error looking up ticket ${ticket_id}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Ticket #${ticket_id} was not found in the IT helpdesk system.`);
    }

    // Security check: Must belong to E101 for employee-facing queries
    if (data.employee_id !== CURRENT_EMPLOYEE_ID) {
      throw new Error(`Access denied: Ticket #${ticket_id} does not belong to your account (${CURRENT_EMPLOYEE_ID}).`);
    }

    return {
      id: data.id,
      subject: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      assigned_team: (data as Record<string, unknown>).support_teams
        ? ((data as Record<string, unknown>).support_teams as { name: string }).name
        : data.team_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },
});

/**
 * TOOL 4: createTicket (Write Tool)
 * Creates a real support ticket in Supabase when an issue is unresolved or escalated.
 */
const createTicket = defineTool({
  name: "createTicket",
  description:
    "Use this when an employee's IT issue cannot be resolved using the knowledge base, when troubleshooting failed, or when the employee explicitly asks to create or escalate a ticket. Inserts a real ticket into the database.",
  writes: true,
  schema: createTicketSchema,
  run: async ({ subject, description, category, priority, impact }) => {
    const supabase = getSupabase();

    // Determine support team based on category and description
    const team_id = resolveTeamId(category, subject, description);

    // Determine priority according to sla_rules and security rules
    const isSecurity =
      category === "Security" ||
      subject.toLowerCase().includes("suspicious") ||
      subject.toLowerCase().includes("phishing") ||
      description.toLowerCase().includes("suspicious link") ||
      description.toLowerCase().includes("clicked");

    const resolvedPriority = resolvePriority(priority, impact, isSecurity);

    const newTicket = {
      employee_id: CURRENT_EMPLOYEE_ID,
      title: subject,
      description,
      category,
      priority: resolvedPriority,
      team_id,
      status: "open",
    };

    const { data, error } = await supabase
      .from("tickets")
      .insert(newTicket)
      .select("id, employee_id, title, description, category, priority, team_id, status, created_at, updated_at, support_teams(name)")
      .single();

    if (error) {
      console.error("[createTicket] Supabase error:", error);
      throw new Error(`Failed to create ticket in database: ${error.message}`);
    }

    return {
      ticket_id: data.id,
      subject: data.title,
      category: data.category,
      priority: data.priority,
      status: data.status,
      assigned_team: (data as Record<string, unknown>).support_teams
        ? ((data as Record<string, unknown>).support_teams as { name: string }).name
        : data.team_id,
      created_at: data.created_at,
      message: `Ticket #${data.id} has been created successfully and assigned to ${
        (data as Record<string, unknown>).support_teams
          ? ((data as Record<string, unknown>).support_teams as { name: string }).name
          : data.team_id
      } with priority ${data.priority}.`,
    };
  },
});

/**
 * TOOL 5: updateTicket (Write Tool)
 * Allows authorized IT administrators to update ticket status or assigned team.
 */
const updateTicket = defineTool({
  name: "updateTicket",
  description:
    "Use this when an authorized IT administrator wants to update a ticket's status (such as moving it to in_progress or resolved) or reassign it to a different support team.",
  writes: true,
  schema: updateTicketSchema,
  run: async ({ ticket_id, status, team_id }) => {
    // 1. Verify administrator authorization on the server
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized: Only IT administrators are permitted to update ticket details or change status.");
    }

    const supabase = getSupabase();

    // 2. Verify ticket exists
    const { data: existing, error: fetchError } = await supabase
      .from("tickets")
      .select("id, status, team_id, title")
      .eq("id", ticket_id)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new Error(`Ticket #${ticket_id} does not exist.`);
    }

    // 3. Verify status transition
    if (!isValidStatusTransition(existing.status as TicketStatus, status as TicketStatus)) {
      throw new Error(
        `Invalid status transition: Cannot change ticket #${ticket_id} status from '${existing.status}' to '${status}'.`
      );
    }

    // 4. Update the ticket
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (team_id) {
      updatePayload.team_id = team_id;
    }

    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticket_id)
      .select("id, title, status, priority, category, team_id, updated_at, support_teams(name)")
      .single();

    if (updateError) {
      console.error("[updateTicket] Supabase error:", updateError);
      throw new Error(`Failed to update ticket #${ticket_id}: ${updateError.message}`);
    }

    return {
      ticket_id: updated.id,
      subject: updated.title,
      status: updated.status,
      assigned_team: (updated as Record<string, unknown>).support_teams
        ? ((updated as Record<string, unknown>).support_teams as { name: string }).name
        : updated.team_id,
      updated_at: updated.updated_at,
      message: `Ticket #${updated.id} status successfully updated to '${updated.status}'.`,
    };
  },
});

/** All 5 tools given to Gemini */
export const tools: AgentTool[] = [
  searchKnowledgeBase,
  getMyTickets,
  getTicketStatus,
  createTicket,
  updateTicket,
];
