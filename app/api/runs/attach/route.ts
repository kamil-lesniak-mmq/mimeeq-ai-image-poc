import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { run_id, prompt_id, image_id } = await req.json();

  const { error } = await supabaseServer.from("generation_inputs").insert({
    run_id,
    prompt_id,
    image_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
