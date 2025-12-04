import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSessionUserId } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const userId = (await cookies()).get("mmq-user")?.value;

  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabaseServer
    .from("user_images")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json([]);

  return NextResponse.json(data);
}
