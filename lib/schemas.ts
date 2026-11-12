import { z } from "zod";

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .describe("Date in YYYY-MM-DD format");

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(4000),
});

export const agentRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Tool Schemas
export const searchKnowledgeBaseSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .describe("The search query or problem keywords describing the IT issue, e.g. 'vpn disconnect', 'wifi', 'password reset', 'phishing link'"),
  category: z
    .enum(["VPN", "Network", "Account", "Access", "Email", "Apps", "Hardware", "Security"])
    .optional()
    .describe("Optional category to narrow down the knowledge base search"),
});

export const getMyTicketsSchema = z.object({
  status: z
    .enum(["open", "in_progress", "waiting_for_user", "resolved", "closed", "all"])
    .optional()
    .describe("Filter tickets by status. Default returns all tickets for the employee."),
});

export const getTicketStatusSchema = z.object({
  ticket_id: z
    .number()
    .int()
    .positive()
    .describe("The numeric ID of the ticket to retrieve status and details for"),
});

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .describe("Clear, concise subject/title of the ticket, e.g., 'VPN keeps disconnecting'"),
  description: z
    .string()
    .trim()
    .min(5)
    .max(2000)
    .describe("Detailed explanation of the issue, symptoms, and troubleshooting steps already attempted"),
  category: z
    .enum(["VPN", "Network", "Account", "Access", "Email", "Apps", "Hardware", "Security"])
    .describe("The category of the issue matching company IT categories"),
  priority: z
    .enum(["P1", "P2", "P3", "P4"])
    .optional()
    .describe("SLA priority: P1 (Many users blocked or security issue), P2 (One user fully blocked), P3 (Work slowed), P4 (Request or question)"),
  impact: z
    .string()
    .optional()
    .describe("Impact context describing who is affected, e.g., 'One user fully blocked from work' or 'Clicked suspicious link'"),
});

export const updateTicketSchema = z.object({
  ticket_id: z
    .number()
    .int()
    .positive()
    .describe("The numeric ID of the ticket to update"),
  status: z
    .enum(["open", "in_progress", "waiting_for_user", "resolved", "closed"])
    .describe("The new status for the ticket"),
  team_id: z
    .enum(["T1", "T2", "T3", "T4", "T5"])
    .optional()
    .describe("Optional reassignment to another support team (T1..T5)"),
});

// REST API Schemas
export const ticketCreateApiSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(2000),
  category: z.enum(["VPN", "Network", "Account", "Access", "Email", "Apps", "Hardware", "Security"]),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  impact: z.string().optional(),
});

export const adminTicketPatchSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting_for_user", "resolved", "closed"]).optional(),
  team_id: z.enum(["T1", "T2", "T3", "T4", "T5"]).optional(),
});
