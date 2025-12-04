import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const userId = (await cookies()).get("mmq-user")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Missing session" }, { status: 401 });
  }

  const { run_id, items } = await req.json();

  if (!run_id || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Invalid nanobanana payload" },
      { status: 400 }
    );
  }

  const results = [];

  for (const item of items) {
    const {
      prompt_id,
      prompt,
      aspect_ratio,
      output_type,
      reference_images,
    } = item;

    if (!prompt || !reference_images?.length) continue;

    try {
      // ✅ 1️⃣ CALL NANOBANANA WITH MULTIPLE REFS
      const nanoRes = await fetch(process.env.NANOBANANA_API_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NANOBANANA_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio,
          output_type,
          reference_images, // ✅ ARRAY
        }),
      });

      const nanoJson = await nanoRes.json();

      if (!nanoJson?.results?.length) {
        throw new Error("Nanobanana returned no results");
      }

      // ✅ 2️⃣ SAVE ALL RESULTS
      for (const result of nanoJson.results) {
        const { data, error } = await supabaseServer
          .from("run_results")
          .insert({
            user_id: userId,
            run_id,
            prompt_id,
            output_type,
            result_url: result.result_url,
            reference_images, // ✅ provenance
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to save result");
        }

        results.push(data);
      }
    } catch (err: any) {
      console.error("Nanobanana error:", err);
      results.push({
        id: crypto.randomUUID(),
        output_type,
        result_url: null,
        error: err.message,
      });
    }
  }

  return NextResponse.json({ results });
}
