import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isUserAdmin } from "@/lib/adminAuth";
import { adminTicketPatchSchema } from "@/lib/schemas";
import { isValidStatusTransition, type TicketStatus } from "@/lib/helpdesk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/tickets/[id]
 * Administrator endpoint to update ticket status and/or assign support team.
 * Strictly verifies admin authorization and valid lifecycle status transitions.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify administrator authorization
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Only authorized IT administrators can update tickets." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID format." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = adminTicketPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, team_id } = parsed.data;
    if (!status && !team_id) {
      return NextResponse.json(
        { error: "At least one of 'status' or 'team_id' must be provided." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 2. Fetch existing ticket
    const { data: existing, error: fetchError } = await supabase
      .from("tickets")
      .select("id, status, team_id, title")
      .eq("id", ticketId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: `Ticket #${ticketId} was not found.` },
        { status: 404 }
      );
    }

    // 3. Verify status transition
    if (status && !isValidStatusTransition(existing.status as TicketStatus, status as TicketStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition: Cannot move ticket #${ticketId} from '${existing.status}' to '${status}'.`,
        },
        { status: 400 }
      );
    }

    // 4. Update the ticket
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (team_id) updatePayload.team_id = team_id;

    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select("id, employee_id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(id, name), employees(name, email)")
      .single();

    if (updateError) {
      console.error(`[PATCH /api/admin/tickets/${ticketId}] Error:`, updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Ticket #${ticketId} updated successfully.`,
      ticket: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error(`[PATCH /api/admin/tickets] Exception:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

