import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isUserAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tickets
 * IT Admin endpoint: returns all tickets across the entire organization.
 * Protected by server-side administrator authorization.
 */
export async function GET(request: Request) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const supabase = getSupabase();
    let query = supabase
      .from("tickets")
      .select("id, employee_id, title, description, category, priority, status, team_id, created_at, updated_at, support_teams(id, name, handles), employees(id, name, email, department, location, laptop_model)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GET /api/admin/tickets] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: data?.length ?? 0,
      tickets: data ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[GET /api/admin/tickets] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

