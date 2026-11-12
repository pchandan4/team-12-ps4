import type {
  EmployeeRecord,
  SupportTeamRecord,
  SlaRuleRecord,
  KbArticleRecord,
  TicketRecord,
} from "./helpdesk";

// Seed data extracted strictly from seed/ps4_it_helpdesk.sql
export const SEED_SUPPORT_TEAMS: SupportTeamRecord[] = [
  { id: "T1", name: "Network & VPN", handles: "VPN, Wi-Fi, internet, network drives, remote access" },
  { id: "T2", name: "Accounts & Access", handles: "passwords, account lock, MFA, email access, software access requests" },
  { id: "T3", name: "Hardware", handles: "laptops, monitors, keyboards, printers, chargers, docking stations" },
  { id: "T4", name: "Software & Apps", handles: "Office apps, Teams, Outlook, IDEs, software install and errors" },
  { id: "T5", name: "Security", handles: "phishing, suspicious links, virus alerts, lost devices, data leaks" },
];

export const SEED_SLA_RULES: SlaRuleRecord[] = [
  { priority: "P1", meaning: "Many users blocked, or a security issue", response_hours: 1, resolve_hours: 4 },
  { priority: "P2", meaning: "One user fully blocked from work", response_hours: 4, resolve_hours: 8 },
  { priority: "P3", meaning: "Work is slowed but the user can continue", response_hours: 8, resolve_hours: 24 },
  { priority: "P4", meaning: "A request or question, not a fault", response_hours: 24, resolve_hours: 72 },
];

export const SEED_EMPLOYEES: EmployeeRecord[] = [
  { id: "E101", name: "Karthik S", email: "karthik.s@zentrix.example.com", department: "Engineering", location: "Chennai", laptop_model: "ThinkBook 14 G5" },
  { id: "E102", name: "Nandhini R", email: "nandhini.r@zentrix.example.com", department: "Engineering", location: "Chennai", laptop_model: "ThinkBook 14 G5" },
  { id: "E103", name: "Rohit Sharma", email: "rohit.sharma@zentrix.example.com", department: "Engineering", location: "Bengaluru", laptop_model: "Latitude 5440" },
  { id: "E104", name: "Aisha Khan", email: "aisha.khan@zentrix.example.com", department: "Design", location: "Bengaluru", laptop_model: "MacBook Air M2" },
  { id: "E105", name: "Sanjay Murthy", email: "sanjay.murthy@zentrix.example.com", department: "Finance", location: "Chennai", laptop_model: "Latitude 5440" },
  { id: "E106", name: "Deepa Pillai", email: "deepa.pillai@zentrix.example.com", department: "HR", location: "Kochi", laptop_model: "ThinkPad E14" },
  { id: "E107", name: "Vignesh Kumar", email: "vignesh.kumar@zentrix.example.com", department: "Engineering", location: "Chennai", laptop_model: "ThinkBook 14 G5" },
  { id: "E108", name: "Harini Venkat", email: "harini.venkat@zentrix.example.com", department: "Sales", location: "Hyderabad", laptop_model: "ThinkPad E14" },
  { id: "E109", name: "Abdul Rahman", email: "abdul.rahman@zentrix.example.com", department: "Support", location: "Chennai", laptop_model: "Latitude 3440" },
  { id: "E110", name: "Neha Gupta", email: "neha.gupta@zentrix.example.com", department: "Marketing", location: "Pune", laptop_model: "MacBook Air M2" },
  { id: "E111", name: "Praveen Raj", email: "praveen.raj@zentrix.example.com", department: "Engineering", location: "Coimbatore", laptop_model: "ThinkBook 14 G5" },
  { id: "E112", name: "Shalini Das", email: "shalini.das@zentrix.example.com", department: "Finance", location: "Kolkata", laptop_model: "Latitude 5440" },
  { id: "E113", name: "Gokul Krishnan", email: "gokul.krishnan@zentrix.example.com", department: "Engineering", location: "Chennai", laptop_model: "Latitude 5440" },
  { id: "E114", name: "Mythili S", email: "mythili.s@zentrix.example.com", department: "Support", location: "Chennai", laptop_model: "Latitude 3440" },
  { id: "E115", name: "Tarun Mehta", email: "tarun.mehta@zentrix.example.com", department: "Sales", location: "Mumbai", laptop_model: "ThinkPad E14" },
];

export const SEED_KB_ARTICLES: KbArticleRecord[] = [
  {
    id: 1,
    title: "VPN keeps disconnecting",
    category: "VPN",
    keywords: "vpn disconnect drop unstable",
    solution_steps: "1. Close the VPN app fully and open it again.\n2. Switch to a stable Wi-Fi or mobile hotspot.\n3. In the VPN app, choose the nearest server (Chennai or Bengaluru).\n4. Update the VPN client from the Company Portal.\n5. Restart the laptop if it still drops.",
    team_id: "T1",
  },
  {
    id: 2,
    title: "VPN login fails with authentication error",
    category: "VPN",
    keywords: "vpn login authentication error password",
    solution_steps: "1. Check that your laptop password has not expired.\n2. Approve the MFA prompt on your phone within 60 seconds.\n3. Make sure the date and time on your laptop are correct.\n4. Try again after 5 minutes.",
    team_id: "T1",
  },
  {
    id: 3,
    title: "Office Wi-Fi not connecting",
    category: "Network",
    keywords: "wifi wireless not connecting office",
    solution_steps: "1. Forget the ZENTRIX-CORP network and connect again.\n2. Log in with your company email and password.\n3. Turn Wi-Fi off and on.\n4. If other people near you also cannot connect, report it as a P1.",
    team_id: "T1",
  },
  {
    id: 4,
    title: "Slow internet in office",
    category: "Network",
    keywords: "slow internet speed lag",
    solution_steps: "1. Run a speed test at speedtest.example.com.\n2. Close large downloads and video streams.\n3. Move closer to the access point or use a LAN cable.\n4. Share the speed test result in your ticket.",
    team_id: "T1",
  },
  {
    id: 5,
    title: "Cannot open shared network drive",
    category: "Network",
    keywords: "shared drive network folder mapped drive",
    solution_steps: "1. Connect to VPN if you are outside the office.\n2. Open File Explorer and type \\\\fileserver\\shared.\n3. If access is denied, request access from your manager.",
    team_id: "T1",
  },
  {
    id: 6,
    title: "Reset forgotten password",
    category: "Account",
    keywords: "password forgot reset",
    solution_steps: "1. Go to passwordreset.zentrix.example.com.\n2. Enter your company email.\n3. Approve the MFA prompt.\n4. Set a new password with 12 or more characters.",
    team_id: "T2",
  },
  {
    id: 7,
    title: "Account locked after wrong passwords",
    category: "Account",
    keywords: "locked account lockout",
    solution_steps: "1. Wait 15 minutes. The lock clears by itself.\n2. Then reset your password at passwordreset.zentrix.example.com.\n3. If it locks again, raise a ticket. Something may be using your old password.",
    team_id: "T2",
  },
  {
    id: 8,
    title: "MFA not working on new phone",
    category: "Account",
    keywords: "mfa authenticator new phone otp",
    solution_steps: "1. Log in at mfa.zentrix.example.com from your laptop.\n2. Remove the old phone and add the new one.\n3. If you cannot log in at all, raise a P2 ticket for Accounts & Access.",
    team_id: "T2",
  },
  {
    id: 9,
    title: "Request access to a software tool",
    category: "Access",
    keywords: "access request software license jira github",
    solution_steps: "1. Raise a P4 ticket with the tool name and the reason.\n2. Your manager will get an approval email.\n3. Access is given within 1 working day after approval.",
    team_id: "T2",
  },
  {
    id: 10,
    title: "Outlook not receiving emails",
    category: "Email",
    keywords: "outlook email not receiving inbox",
    solution_steps: "1. Check your internet and VPN connection.\n2. Check the Junk and Other folders.\n3. Restart Outlook.\n4. Check if your mailbox is full (File > Info).",
    team_id: "T4",
  },
  {
    id: 11,
    title: "Outlook keeps asking for password",
    category: "Email",
    keywords: "outlook password prompt repeatedly",
    solution_steps: "1. Close Outlook.\n2. Open Credential Manager and remove saved Office entries.\n3. Open Outlook and sign in again.",
    team_id: "T4",
  },
  {
    id: 12,
    title: "Teams audio or video not working",
    category: "Apps",
    keywords: "teams microphone camera audio video call",
    solution_steps: "1. In Teams, open Settings > Devices and pick the right microphone and camera.\n2. Close other apps that use the camera.\n3. Check Windows privacy settings for camera and microphone.\n4. Restart Teams.",
    team_id: "T4",
  },
  {
    id: 13,
    title: "Install approved software",
    category: "Apps",
    keywords: "install software company portal",
    solution_steps: "1. Open Company Portal.\n2. Search for the software.\n3. Click Install.\n4. If it is not listed, raise a P4 access request.",
    team_id: "T4",
  },
  {
    id: 14,
    title: "Excel crashes when opening large files",
    category: "Apps",
    keywords: "excel crash freeze large file",
    solution_steps: "1. Open Excel in safe mode (hold Ctrl while opening).\n2. Turn off add-ins under File > Options > Add-ins.\n3. Run Office Repair from Settings > Apps.",
    team_id: "T4",
  },
  {
    id: 15,
    title: "VS Code extensions not installing",
    category: "Apps",
    keywords: "vscode extension install proxy",
    solution_steps: "1. Connect to VPN.\n2. Set the company proxy in VS Code settings (http.proxy).\n3. Restart VS Code and try again.",
    team_id: "T4",
  },
  {
    id: 16,
    title: "Laptop running very slow",
    category: "Hardware",
    keywords: "laptop slow hang performance",
    solution_steps: "1. Restart the laptop (do this at least once a week).\n2. Close unused browser tabs and apps.\n3. Check free disk space; keep at least 20 GB free.\n4. Run pending Windows updates.",
    team_id: "T3",
  },
  {
    id: 17,
    title: "Laptop not charging",
    category: "Hardware",
    keywords: "laptop battery charging charger",
    solution_steps: "1. Try another power socket.\n2. Check the charger cable for damage.\n3. Remove the battery saver setting.\n4. If it still does not charge, raise a P2 ticket for a charger or battery check.",
    team_id: "T3",
  },
  {
    id: 18,
    title: "External monitor not detected",
    category: "Hardware",
    keywords: "monitor display screen hdmi docking",
    solution_steps: "1. Check both ends of the cable.\n2. Press Windows + P and choose Extend.\n3. Try another port or cable.\n4. Update the display driver from Company Portal.",
    team_id: "T3",
  },
  {
    id: 19,
    title: "Printer not printing",
    category: "Hardware",
    keywords: "printer print queue stuck",
    solution_steps: "1. Check the printer has paper and no error light.\n2. Clear the print queue.\n3. Remove and add the printer again from Settings.",
    team_id: "T3",
  },
  {
    id: 20,
    title: "Keyboard or mouse not working",
    category: "Hardware",
    keywords: "keyboard mouse wireless usb",
    solution_steps: "1. Change the batteries for wireless devices.\n2. Plug the USB receiver into another port.\n3. Try the device on another laptop.\n4. Raise a P3 ticket for a replacement.",
    team_id: "T3",
  },
  {
    id: 21,
    title: "Blue screen error",
    category: "Hardware",
    keywords: "blue screen bsod crash restart",
    solution_steps: "1. Note the error code on the screen.\n2. Restart the laptop.\n3. If it happens again, raise a P2 ticket with the error code.",
    team_id: "T3",
  },
  {
    id: 22,
    title: "Clicked a suspicious link",
    category: "Security",
    keywords: "phishing suspicious link clicked email scam",
    solution_steps: "1. Disconnect from the internet right away.\n2. Do not enter any passwords.\n3. Raise a P1 ticket for the Security team immediately.\n4. Change your password from another device.",
    team_id: "T5",
  },
  {
    id: 23,
    title: "Received a phishing email",
    category: "Security",
    keywords: "phishing email report spam",
    solution_steps: "1. Do not click links or open attachments.\n2. Use the Report Phishing button in Outlook.\n3. Delete the email.",
    team_id: "T5",
  },
  {
    id: 24,
    title: "Antivirus shows a threat alert",
    category: "Security",
    keywords: "virus malware antivirus alert threat",
    solution_steps: "1. Do not ignore or close the alert.\n2. Let the antivirus quarantine the file.\n3. Raise a P1 ticket for the Security team with a screenshot.",
    team_id: "T5",
  },
  {
    id: 25,
    title: "Lost or stolen laptop",
    category: "Security",
    keywords: "lost stolen laptop phone device",
    solution_steps: "1. Raise a P1 ticket for the Security team at once.\n2. Change your password from another device.\n3. File a police report for stolen devices and attach it to the ticket.",
    team_id: "T5",
  },
  {
    id: 26,
    title: "USB storage blocked",
    category: "Security",
    keywords: "usb pendrive blocked storage",
    solution_steps: "1. USB storage is blocked by company policy.\n2. Use OneDrive or the shared drive to move files.\n3. For a business need, raise a P4 request with your manager's approval.",
    team_id: "T5",
  },
  {
    id: 27,
    title: "Request a new laptop or upgrade",
    category: "Hardware",
    keywords: "new laptop upgrade replacement ram",
    solution_steps: "1. Raise a P4 ticket with the reason.\n2. Laptops older than 4 years are replaced first.\n3. Your manager approves the request.",
    team_id: "T3",
  },
  {
    id: 28,
    title: "Cannot connect to Git or GitHub",
    category: "Network",
    keywords: "git github clone push ssh proxy",
    solution_steps: "1. Connect to VPN.\n2. Use HTTPS instead of SSH.\n3. Set git proxy: git config --global http.proxy http://proxy.zentrix.example.com:8080",
    team_id: "T1",
  },
  {
    id: 29,
    title: "Disk space full",
    category: "Hardware",
    keywords: "disk space storage full c drive",
    solution_steps: "1. Empty the Recycle Bin.\n2. Run Disk Cleanup.\n3. Move old files to OneDrive.\n4. Uninstall unused apps from Company Portal.",
    team_id: "T3",
  },
  {
    id: 30,
    title: "Calendar invites not showing",
    category: "Email",
    keywords: "calendar meeting invite outlook teams",
    solution_steps: "1. Check that you are looking at the right calendar.\n2. Restart Outlook.\n3. Check the Deleted Items folder.",
    team_id: "T4",
  },
];

// In-memory store for tickets (initialized with seed data, persisted on globalThis)
const INITIAL_SEED_TICKETS: TicketRecord[] = [
  {
    id: 1,
    employee_id: "E101",
    title: "Laptop battery drains fast",
    description: "Battery lasts only 1 hour after full charge.",
    category: "Hardware",
    priority: "P3",
    team_id: "T3",
    status: "in_progress",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    support_teams: { name: "Hardware", handles: "laptops, monitors, keyboards, printers, chargers, docking stations" },
    employees: { name: "Karthik S", email: "karthik.s@zentrix.example.com", department: "Engineering" },
  },
  {
    id: 2,
    employee_id: "E101",
    title: "Need access to Jira project ZEN-PAY",
    description: "Joining the payments team.",
    category: "Access",
    priority: "P4",
    team_id: "T2",
    status: "resolved",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    support_teams: { name: "Accounts & Access", handles: "passwords, account lock, MFA, email access, software access requests" },
    employees: { name: "Karthik S", email: "karthik.s@zentrix.example.com", department: "Engineering" },
  },
  {
    id: 3,
    employee_id: "E103",
    title: "VPN drops every 10 minutes",
    description: "Working from home, VPN keeps dropping.",
    category: "VPN",
    priority: "P3",
    team_id: "T1",
    status: "open",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    support_teams: { name: "Network & VPN", handles: "VPN, Wi-Fi, internet, network drives, remote access" },
    employees: { name: "Rohit Sharma", email: "rohit.sharma@zentrix.example.com", department: "Engineering" },
  },
  {
    id: 4,
    employee_id: "E104",
    title: "Monitor flickering",
    description: "Second monitor flickers on the dock.",
    category: "Hardware",
    priority: "P3",
    team_id: "T3",
    status: "waiting_for_user",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    support_teams: { name: "Hardware", handles: "laptops, monitors, keyboards, printers, chargers, docking stations" },
    employees: { name: "Aisha Khan", email: "aisha.khan@zentrix.example.com", department: "Design" },
  },
  {
    id: 5,
    employee_id: "E105",
    title: "Excel crashes on month-end file",
    description: "Excel freezes when opening the 80 MB report.",
    category: "Apps",
    priority: "P2",
    team_id: "T4",
    status: "in_progress",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    support_teams: { name: "Software & Apps", handles: "Office apps, Teams, Outlook, IDEs, software install and errors" },
    employees: { name: "Sanjay Murthy", email: "sanjay.murthy@zentrix.example.com", department: "Finance" },
  },
  {
    id: 6,
    employee_id: "E108",
    title: "Account locked",
    description: "Locked after password change.",
    category: "Account",
    priority: "P2",
    team_id: "T2",
    status: "resolved",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    support_teams: { name: "Accounts & Access", handles: "passwords, account lock, MFA, email access, software access requests" },
    employees: { name: "Harini Venkat", email: "harini.venkat@zentrix.example.com", department: "Sales" },
  },
  {
    id: 7,
    employee_id: "E110",
    title: "Teams camera not working",
    description: "Camera shows black screen in calls.",
    category: "Apps",
    priority: "P3",
    team_id: "T4",
    status: "open",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    support_teams: { name: "Software & Apps", handles: "Office apps, Teams, Outlook, IDEs, software install and errors" },
    employees: { name: "Neha Gupta", email: "neha.gupta@zentrix.example.com", department: "Marketing" },
  },
  {
    id: 8,
    employee_id: "E112",
    title: "Phishing email received",
    description: "Email asking to update bank details.",
    category: "Security",
    priority: "P3",
    team_id: "T5",
    status: "closed",
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    support_teams: { name: "Security", handles: "phishing, suspicious links, virus alerts, lost devices, data leaks" },
    employees: { name: "Shalini Das", email: "shalini.das@zentrix.example.com", department: "Finance" },
  },
  {
    id: 9,
    employee_id: "E113",
    title: "Need Docker Desktop installed",
    description: "Required for new microservices work.",
    category: "Apps",
    priority: "P4",
    team_id: "T4",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    support_teams: { name: "Software & Apps", handles: "Office apps, Teams, Outlook, IDEs, software install and errors" },
    employees: { name: "Gokul Krishnan", email: "gokul.krishnan@zentrix.example.com", department: "Engineering" },
  },
  {
    id: 10,
    employee_id: "E115",
    title: "Printer in Mumbai office not working",
    description: "Whole sales floor cannot print.",
    category: "Hardware",
    priority: "P2",
    team_id: "T3",
    status: "in_progress",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    support_teams: { name: "Hardware", handles: "laptops, monitors, keyboards, printers, chargers, docking stations" },
    employees: { name: "Tarun Mehta", email: "tarun.mehta@zentrix.example.com", department: "Sales" },
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __deskbot_tickets__: TicketRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __deskbot_next_id__: number | undefined;
}

if (!globalThis.__deskbot_tickets__) {
  globalThis.__deskbot_tickets__ = [...INITIAL_SEED_TICKETS];
  globalThis.__deskbot_next_id__ = 11;
}

function getGlobalTickets(): TicketRecord[] {
  if (!globalThis.__deskbot_tickets__) {
    globalThis.__deskbot_tickets__ = [...INITIAL_SEED_TICKETS];
  }
  return globalThis.__deskbot_tickets__;
}

function getNextTicketId(): number {
  if (!globalThis.__deskbot_next_id__) {
    globalThis.__deskbot_next_id__ = 11;
  }
  return globalThis.__deskbot_next_id__++;
}

/**
 * In-memory client replicating Supabase query builder syntax.
 * Automatically used when SUPABASE_URL is not provided so that
 * the local demo executes 100% smoothly without database credentials.
 */
export function createLocalSupabaseClient() {
  return {
    from(tableName: string) {
      let filtered: any[] = [];

      if (tableName === "support_teams") filtered = [...SEED_SUPPORT_TEAMS];
      else if (tableName === "sla_rules") filtered = [...SEED_SLA_RULES];
      else if (tableName === "employees") filtered = [...SEED_EMPLOYEES];
      else if (tableName === "kb_articles") {
        filtered = SEED_KB_ARTICLES.map((a) => {
          const team = SEED_SUPPORT_TEAMS.find((t) => t.id === a.team_id);
          return {
            ...a,
            support_teams: team ? { id: team.id, name: team.name } : { id: a.team_id, name: a.team_id },
          };
        });
      } else if (tableName === "tickets") {
        filtered = [...getGlobalTickets()];
      }

      const builder = {
        select(fields?: string, options?: { count?: string; head?: boolean }) {
          if (options?.head) {
            return Promise.resolve({ count: filtered.length, error: null, data: null });
          }
          return builder;
        },
        eq(col: string, val: unknown) {
          filtered = filtered.filter((row) => String(row[col]) === String(val));
          return builder;
        },
        order(col: string, options?: { ascending?: boolean }) {
          filtered.sort((a, b) => {
            const valA = a[col] as string | number;
            const valB = b[col] as string | number;
            if (options?.ascending) return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
          });
          return builder;
        },
        limit(n: number) {
          filtered = filtered.slice(0, n);
          return builder;
        },
        then(resolve: (res: { data: unknown; error: null }) => void) {
          resolve({ data: filtered, error: null });
        },
        async maybeSingle() {
          return { data: filtered[0] || null, error: null };
        },
        async single() {
          if (filtered.length === 0) return { data: null, error: { message: "No rows found" } };
          return { data: filtered[0], error: null };
        },
        insert(payload: Record<string, unknown>) {
          const team = SEED_SUPPORT_TEAMS.find((t) => t.id === payload.team_id);
          const emp = SEED_EMPLOYEES.find((e) => e.id === payload.employee_id);
          const newRecord: TicketRecord = {
            id: getNextTicketId(),
            employee_id: String(payload.employee_id || "E101"),
            title: String(payload.title || ""),
            description: String(payload.description || ""),
            category: String(payload.category || ""),
            priority: (payload.priority as TicketRecord["priority"]) || "P3",
            team_id: String(payload.team_id || "T4"),
            status: "open",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            support_teams: team ? { name: team.name, handles: team.handles } : undefined,
            employees: emp ? { name: emp.name, email: emp.email, department: emp.department } : undefined,
          };
          const list = getGlobalTickets();
          globalThis.__deskbot_tickets__ = [newRecord, ...list];
          filtered = [newRecord as unknown as Record<string, unknown>];
          return builder;
        },
        update(payload: Record<string, unknown>) {
          const updateBuilder = {
            eq(col: string, val: unknown) {
              const ticketId = Number(val);
              const list = getGlobalTickets();
              const idx = list.findIndex((t) => t.id === ticketId);
              if (idx !== -1) {
                const team = payload.team_id
                  ? SEED_SUPPORT_TEAMS.find((t) => t.id === payload.team_id)
                  : SEED_SUPPORT_TEAMS.find((t) => t.id === list[idx].team_id);

                list[idx] = {
                  ...list[idx],
                  ...payload,
                  updated_at: new Date().toISOString(),
                  support_teams: team ? { name: team.name, handles: team.handles } : list[idx].support_teams,
                } as TicketRecord;
                filtered = [list[idx] as unknown as Record<string, unknown>];
              }
              return updateBuilder;
            },
            select(fields?: string) {
              return updateBuilder;
            },
            async single() {
              if (filtered.length === 0) return { data: null, error: { message: "Record not found" } };
              return { data: filtered[0], error: null };
            },
          };
          return updateBuilder;
        },
      };

      return builder;
    },
  };
}
