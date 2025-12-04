import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabaseServer
    .from("generation_runs")
    .select("id, name, created_at, generation_results(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return NextResponse.json([]);

  return NextResponse.json(data);
}
