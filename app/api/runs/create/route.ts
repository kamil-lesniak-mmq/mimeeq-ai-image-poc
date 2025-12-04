import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name } = await req.json().catch(() => ({ name: null }));

  const { data, error } = await supabaseServer
    .from("generation_runs")
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Failed to create run" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
