import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { CURRENT_EMPLOYEE_ID } from "@/lib/helpdesk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/tickets/[id]
 * Retrieves details for a specific ticket.
 * Enforces ownership: only Karthik S (E101) can view their tickets.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .select("id, employee_id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(name, handles)")
      .eq("id", ticketId)
      .maybeSingle();

    if (error) {
      console.error(`[GET /api/tickets/${ticketId}] Error:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Ownership check
    if (data.employee_id !== CURRENT_EMPLOYEE_ID) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this ticket" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ticket: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

