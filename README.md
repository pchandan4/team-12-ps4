# DeskBot – AI-Powered IT Helpdesk Ticket Agent
## SRM Agentic AI Hackathon | Problem Statement PS4

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8--flash-blue)](https://aistudio.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC)](https://tailwindcss.com/)

DeskBot is an enterprise-grade agentic AI IT helpdesk application designed for corporate IT support environments. Rather than serving as a passive FAQ chatbot or static dashboard, DeskBot acts as an autonomous tier-1 support agent that independently reasons over user problems, searches official IT manuals, validates SLA obligations, creates tickets, and coordinates with IT administrators.

---

## 1. Project Title & Overview
- **Application Name**: DeskBot
- **Problem Statement**: PS4 – IT Helpdesk Ticket Agent
- **Target Organization**: Zentrix Software Inc.
- **Logged-in Employee Context**:
  - **Employee ID**: `E101`
  - **Name**: Karthik S.
  - **Department**: Engineering
  - **Office Location**: Chennai
  - **Assigned Workstation**: Lenovo ThinkBook 14 G5

---

## 2. Problem Overview
IT departments in software enterprises are overwhelmed with high volumes of repetitive inquiries (VPN disconnects, password resets, Wi-Fi connectivity, software permissions, and hardware faults). 

Key challenges include:
1. **Redundant Ticket Influx**: Employees file tickets for common issues that already have step-by-step troubleshooting solutions in the knowledge base.
2. **Incorrect Team Routing**: Issues are routinely misrouted between Network, Security, Hardware, and Application teams.
3. **Misclassified Urgency**: Critical security incidents (phishing links, virus alerts) are filed with low priority or delayed, while minor software queries are marked urgent.
4. **Disjointed Tracking**: Employees lack real-time visibility into tool activity, SLA commitments, and resolution workflows.

---

## 3. Proposed Solution
DeskBot addresses these inefficiencies with an agentic IT workflow:
1. **Natural Language Understanding**: Understands colloquial, technical, or distressed problem descriptions.
2. **Autonomous Knowledge Retrieval**: Proactively searches the IT Knowledge Base before proposing solutions.
3. **Interactive Troubleshooting**: Explains concrete steps and asks the employee if the issue was resolved.
4. **Intelligent Escalation & Ticket Creation**: If troubleshooting fails or the user reports a security event, DeskBot immediately creates a real support ticket in Supabase.
5. **Accurate SLA & Team Assignment**: Automatically computes priority (`P1`–`P4`) and routes to the correct support team (`T1`–`T5`) according to database SLA policies.
6. **Live Tool Visibility**: Visualizes every read and write tool execution card in real time.
7. **Two-Tier Administration**: Provides an IT Admin Board (Kanban style) for triage, team reassignment, and status transitions with server-side authorization.

---

## 4. Main Features
- **Helpdesk Assistant Chat (`/chat`)**: Multi-turn conversational interface powered by Gemini 3.8 Flash with live `[READ]` and `[WRITE]` tool execution inspection.
- **My Tickets Page (`/tickets`)**: Employee ticket dashboard with multi-criteria filtering (status, priority, search keywords) and ticket detail modals.
- **Employee Overview Dashboard (`/`)**: Real-time metric counters (Total, Open, In Progress, Resolved, Critical P1) computed from Supabase, workstation status, and quick triage shortcuts.
- **IT Admin Board (`/admin`)**: Operations board categorized into Open, In Progress, and Resolved columns, featuring a prominent P1 Critical alert banner and state-machine-validated status transitions.
- **Server-Side Security & Passcode Gate**: Tiered session verification ensuring employees can only view their own tickets (`E101`), and only verified administrators can modify ticket status.

---

## 5. Technology Stack
- **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Route Handlers, Zod Schema Validation, Server-Only Modules
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI Engine**: Google Gemini API via `@google/genai` (Model: `gemini-3.8-flash`)
- **Architecture**: `defineTool` pattern with JSON Schema sanitization and server-side execution loop

---

## 6. Database Schema (`seed/ps4_it_helpdesk.sql`)

The application interacts with 5 tables defined in PostgreSQL:

1. `employees`
   - `id` (text PK, e.g. `E101`)
   - `name`, `email`, `department`, `location`, `laptop_model`
2. `support_teams`
   - `id` (text PK, e.g. `T1`..`T5`)
   - `name`: `Network & VPN` (T1), `Accounts & Access` (T2), `Hardware` (T3), `Software & Apps` (T4), `Security` (T5)
   - `handles`: Description of functional scope
3. `sla_rules`
   - `priority` (text PK: `P1`, `P2`, `P3`, `P4`)
   - `meaning`: Business urgency definition
   - `response_hours`: Target initial response time
   - `resolve_hours`: Target resolution time
4. `kb_articles`
   - `id` (bigint generated identity PK)
   - `title`, `category`, `keywords`, `solution_steps`, `team_id`
5. `tickets`
   - `id` (bigint generated identity PK)
   - `employee_id` (FK $\to$ `employees.id`)
   - `title`, `description`, `category`
   - `priority` (FK $\to$ `sla_rules.priority`)
   - `team_id` (FK $\to$ `support_teams.id`)
   - `status`: `open`, `in_progress`, `waiting_for_user`, `resolved`, `closed`
   - `created_at`, `updated_at` (timestamptz)

---

## 7. Agent Tools (The 5 Core Tools)

All tools are declared in `lib/agent/tools.ts` and provided to Gemini:

| Tool Name | Type | Writes Data | Description & Operation |
| :--- | :--- | :--- | :--- |
| `searchKnowledgeBase` | Read | No | "Use this when the employee reports an IT problem..." Searches `kb_articles` across title, keywords, category, and solution steps. Returns matching guides and responsible teams. |
| `getMyTickets` | Read | No | "Use this when the employee asks to see or list their tickets..." Queries `tickets` locked to `CURRENT_EMPLOYEE_ID = "E101"`. |
| `getTicketStatus` | Read | No | "Use this when the employee asks about the status of a specific ticket..." Verifies ticket exists and enforces employee ownership (`employee_id === "E101"`). |
| `createTicket` | Write | Yes | "Use this when an employee's issue is unresolved or requires escalation..." Validates parameters with Zod, checks SLA rules, routes to support team (`T1`..`T5`), and inserts into Supabase. |
| `updateTicket` | Write | Yes | "Use this when an authorized IT administrator wants to update status..." Verifies admin credentials on the server, validates status transition, and updates `tickets`. |

---

## 8. Agent Execution Loop & Architecture

```
  +-----------------------------------------------------------+
  |                   Employee Chat Interface                 |
  +-----------------------------------------------------------+
                                |  (User prompt in natural language)
                                v
  +-----------------------------------------------------------+
  |                Next.js API: POST /api/agent               |
  +-----------------------------------------------------------+
                                |  (Conversation history + Tools)
                                v
  +-----------------------------------------------------------+
  |                 Google Gemini 3.8 Flash                   |
  |             (Reasoning & Tool Selection)                  |
  +-----------------------------------------------------------+
                                |  (Function Call Request)
                                v
  +-----------------------------------------------------------+
  |              Server-Side Zod Validation                   |
  +-----------------------------------------------------------+
                                |  (Validated Arguments)
                                v
  +-----------------------------------------------------------+
  |            Database Operation via Supabase SDK            |
  |              (RLS Protected Service Client)               |
  +-----------------------------------------------------------+
                                |  (Structured DB Results)
                                v
  +-----------------------------------------------------------+
  |             Gemini Receives Function Response             |
  |           (Loops if sequential tool required)             |
  +-----------------------------------------------------------+
                                |  (Final Synthesis)
                                v
  +-----------------------------------------------------------+
  |          Frontend Renders Response & Tool Cards           |
  +-----------------------------------------------------------+
```

> **Crucial Architectural Principle**:
> Gemini does **never** access the database directly, nor does it generate raw SQL. Gemini only issues a structured function call request. Our server-side code inspects the request, validates the arguments with Zod, enforces authorization rules (`CURRENT_EMPLOYEE_ID = "E101"`), and executes the operation via the Supabase SDK.

---

## 9. API Routes

- `GET  /api/health` — System health check verifying Gemini API configuration, Supabase connection, and PS4 database table availability.
- `GET  /api/tickets` — Retrieves all tickets for Karthik S (`E101`) with optional status filter.
- `POST /api/tickets` — Inserts a new support ticket for `E101`.
- `GET  /api/tickets/[id]` — Retrieves single ticket details, strictly enforcing `E101` ownership.
- `GET  /api/admin/tickets` — Retrieves organization-wide tickets for the IT Admin Board.
- `PATCH /api/admin/tickets/[id]` — Updates ticket status or support team (requires administrator authorization).
- `GET  /api/admin/auth` — Checks active administrator session status.
- `POST /api/admin/auth` — Authenticates administrator with `ADMIN_PASSCODE` and sets secure cookie.
- `POST /api/agent` — Main agent execution endpoint (up to 8 reasoning rounds).

---

## 10. Environment Variables

Create a file named `.env.local` in the project root:

```env
# Google AI Studio Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Mandatory Gemini model
GEMINI_MODEL=gemini-3.8-flash

# Supabase Project URL (from Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co

# Supabase Secret Key (service_role key - never expose to frontend)
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Team Passcode protecting the application
APP_PASSCODE=srm123

# IT Administrator Passcode for IT Admin Board triage
ADMIN_PASSCODE=admin123
```

---

## 11. Local Setup & Installation

### Step 1: Clone and Navigate
```bash
git clone https://github.com/learn2simple/srm-agent-hackathon-starter.git deskbot
cd deskbot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Database in Supabase
1. Open your Supabase project -> **SQL Editor**.
2. Run `seed/ps4_it_helpdesk.sql`. This creates and seeds `employees`, `support_teams`, `sla_rules`, `kb_articles`, and `tickets`.

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env.local` and insert your credentials:
```bash
cp .env.example .env.local
```

### Step 5: Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 12. Demo Scenarios for Hackathon Evaluation

| Demo Scenario | User Input / Action | Expected Agent & System Behavior |
| :--- | :--- | :--- |
| **1. VPN Troubleshooting** | *"My VPN keeps disconnecting since morning."* | Calls `searchKnowledgeBase`. Returns official 5-step troubleshooting guide. Inquires if the issue was resolved. |
| **2. Ticket Escalation** | *"The solution did not work. Please create a ticket."* | Understands context, autonomously calls `createTicket`. Assigns priority `P3`, routes to `Network & VPN (T1)`, returns real Ticket ID, and records in Supabase. |
| **3. Security Incident** | *"I clicked a strange link in an email."* | Identifies security emergency. Auto-classifies as **P1**, routes to **Security (`T5`)**, calls `createTicket`, and instructs user to disconnect from network. |
| **4. Ticket Tracking** | *"What is the status of my laptop ticket?"* | Calls `getMyTickets` or `getTicketStatus`. Retrieves real ticket `#1` (`in_progress`, `Hardware T3`), providing accurate status. |
| **5. IT Admin Board Triage** | Navigate to `/admin`, unlock with `admin123`, update ticket to `in_progress`. | Verifies server-side authorization. Executes `PATCH /api/admin/tickets/[id]`. Updated status immediately reflects on employee's `/tickets` screen. |
| **6. Ambiguous Request** | *"My computer is not working."* | Asks clarifying questions (symptoms, error message) without hallucinating solutions or raising premature tickets. |
| **7. Security & Isolation** | Requesting tickets for another employee (`E103`). | Server-side security blocks query: employee-facing tools only access `E101`. |

---

## 13. UI/UX Design System
- **Main Background**: Pure White (`#FFFFFF`) / Light Grey (`#F7F8FA`)
- **Navigation Sidebar**: Dark Corporate Navy (`#17243A`)
- **Primary Buttons**: Enterprise Blue (`#2563EB`)
- **Typography & Text**: Dark Slate (`#1E293B`) and Secondary Grey (`#64748B`)
- **Badges**: P1 Critical (Red), P2 High (Amber), P3 Medium (Blue), P4 Request (Slate)

---

## 14. Verification Commands

```bash
# 1. Run TypeScript type validation
npm run typecheck

# 2. Run Next.js production build
npm run build

# 3. Test API Health Check
curl -s http://localhost:3000/api/health
```

---

## 15. Team Details

- **Problem Statement**: PS4 – IT Helpdesk Ticket Agent
- **Team Name**: [Insert Team Name]
- **Team Members**:
  - Member 1: [Name - Roll Number / Email]
  - Member 2: [Name - Roll Number / Email]
  - Member 3: [Name - Roll Number / Email]
  - Member 4: [Name - Roll Number / Email]
- **Institution**: SRM Institute of Science and Technology
