import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const userId = (await cookies()).get("mmq-user")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing session" },
      { status: 401 }
    );
  }

  const { image_url, source, source_ref } = await req.json();

  console.log("✅ SAVING IMAGE WITH:", {
    userId,
    image_url,
    source,
    source_ref,
  });

  if (!image_url || typeof image_url !== "string") {
    return NextResponse.json(
      { error: "Invalid image_url" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("user_images")
    .insert({
      user_id: userId,              // ✅ REAL UUID
      image_url,                    // ✅ REAL URL
      source: source ?? "mimeeq",
      source_ref: source_ref ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("🔥 INSERT ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
