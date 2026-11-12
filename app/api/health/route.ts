import { NextResponse } from "next/server";
import { getSupabase, isUsingLiveSupabase } from "@/lib/supabase";
import { GEMINI_MODEL } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Evaluates system readiness, database connectivity, and PS4 table availability.
 * Never exposes credentials or secrets.
 */
export async function GET() {
  const isLiveDb = isUsingLiveSupabase();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  const envStatus = {
    gemini_api_key_configured: hasGeminiKey,
    gemini_model: GEMINI_MODEL,
    supabase_url_configured: Boolean(process.env.SUPABASE_URL?.trim()),
    supabase_secret_key_configured: Boolean(process.env.SUPABASE_SECRET_KEY?.trim()),
    app_passcode_configured: Boolean(process.env.APP_PASSCODE?.trim()),
    admin_passcode_configured: Boolean(process.env.ADMIN_PASSCODE?.trim() || process.env.APP_PASSCODE?.trim()),
    mode: isLiveDb ? "live_supabase" : "local_demo_store (seed/ps4_it_helpdesk.sql)",
  };

  const ps4Tables = ["employees", "support_teams", "kb_articles", "tickets", "sla_rules"];
  const tableStatus: Record<string, { available: boolean; count?: number; error?: string }> = {};

  let dbConnected = true;

  try {
    const supabase = getSupabase();
    for (const table of ps4Tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        tableStatus[table] = { available: false, error: (error as { message?: string }).message || "Table error" };
        dbConnected = false;
      } else {
        tableStatus[table] = { available: true, count: count ?? 0 };
      }
    }
  } catch (err) {
    console.error("[health] Connectivity check error:", err);
    dbConnected = false;
  }

  return NextResponse.json({
    status: "healthy",
    application: "DeskBot - IT Helpdesk Ticket Agent",
    problem_statement: "PS4",
    authenticated_employee: "E101 (Karthik S)",
    database: {
      connected: dbConnected,
      engine: isLiveDb ? "Supabase PostgreSQL (Remote)" : "Local Seed Store (In-Memory PS4 Database)",
      tables: tableStatus,
    },
    environment: envStatus,
    timestamp: new Date().toISOString(),
  });
}
