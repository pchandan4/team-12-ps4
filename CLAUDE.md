# DeskBot – AI-Powered IT Helpdesk Ticket Agent
## SRM Agentic AI Hackathon | Problem Statement PS4

### Project Overview
DeskBot is an AI-powered IT Helpdesk Ticket Agent for software company employees.
Logged-in employee: Karthik S (Employee ID: E101) at Zentrix Software.

### Technology Stack
- **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Zod Validation, Server-Only
- **Database**: Supabase PostgreSQL, Supabase JS SDK (`@supabase/supabase-js`)
- **AI**: Google Gemini API via `@google/genai` (Model: `gemini-3.8-flash`)
- **Tools Pattern**: `defineTool()` with Zod schema and JSON schema conversion

### Core Architectural Rules
1. **Never Invent Data**: Real database IDs, titles, categories, priorities, and articles only.
2. **Security & Ownership**: Constant `CURRENT_EMPLOYEE_ID = "E101"`. Never accept `employee_id` from Gemini as a tool argument. All employee-facing tools and queries are locked to E101.
3. **Admin Authorization**: Only authenticated administrators can execute `updateTicket` or access admin modification endpoints.
4. **Agentic Autonomy**: Gemini independently selects tools. `MAX_ROUNDS = 8`.
5. **Database Schema Integrity**: Strictly adhere to `seed/ps4_it_helpdesk.sql`:
   - `employees` (`id`, `name`, `email`, `department`, `location`, `laptop_model`)
   - `support_teams` (`id`, `name`, `handles`)
   - `sla_rules` (`priority`, `meaning`, `response_hours`, `resolve_hours`)
   - `kb_articles` (`id`, `title`, `category`, `keywords`, `solution_steps`, `team_id`)
   - `tickets` (`id`, `employee_id`, `title`, `description`, `category`, `priority`, `team_id`, `status`, `created_at`, `updated_at`)
6. **SLA Priority Mapping**:
   - P1: Many users blocked OR security issue (1h response, 4h resolve)
   - P2: One user fully blocked (4h response, 8h resolve)
   - P3: Work is slowed down (8h response, 24h resolve)
   - P4: A request or question (24h response, 72h resolve)
7. **Security Incident Escalation**: Suspicious email links, virus alerts, stolen devices are classified as P1, assigned to Security (`T5`), and escalated immediately.
8. **UI/UX Design**: Enterprise software aesthetic. Navy sidebar (`#17243A`), white card backgrounds, light slate text, professional status badges, live tool execution tracking cards.

