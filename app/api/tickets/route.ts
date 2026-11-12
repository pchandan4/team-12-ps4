import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { ticketCreateApiSchema } from "@/lib/schemas";
import {
  CURRENT_EMPLOYEE_ID,
  resolveTeamId,
  resolvePriority,
} from "@/lib/helpdesk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/tickets
 * Retrieves all tickets filed by Karthik S (E101).
 * Supports optional ?status= filter.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = getSupabase();
    let query = supabase
      .from("tickets")
      .select("id, employee_id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(id, name, handles)")
      .eq("employee_id", CURRENT_EMPLOYEE_ID)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GET /api/tickets] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      employee_id: CURRENT_EMPLOYEE_ID,
      tickets: data ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[GET /api/tickets] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/tickets
 * Creates a support ticket for Karthik S (E101).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = ticketCreateApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, category, priority, impact } = parsed.data;

    // Resolve support team & priority
    const team_id = resolveTeamId(category, title, description);
    const isSecurity =
      category === "Security" ||
      title.toLowerCase().includes("suspicious") ||
      description.toLowerCase().includes("suspicious link");
    const resolvedPriority = resolvePriority(priority, impact, isSecurity);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        employee_id: CURRENT_EMPLOYEE_ID,
        title,
        description,
        category,
        priority: resolvedPriority,
        team_id,
        status: "open",
      })
      .select("id, employee_id, title, description, category, priority, team_id, status, created_at, updated_at, support_teams(name)")
      .single();

    if (error) {
      console.error("[POST /api/tickets] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/tickets] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

