import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type Body =
  | { url: string; filename?: string }
  | { base64: string; filename?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    let fileData: Uint8Array;
    let contentType = "image/png";

    if ("url" in body && body.url) {
      const res = await fetch(body.url);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch image from URL" },
          { status: 400 }
        );
      }
      contentType = res.headers.get("content-type") ?? "image/png";
      const arr = await res.arrayBuffer();
      fileData = new Uint8Array(arr);
    } else if ("base64" in body && body.base64) {
      const match = body.base64.match(/^data:(.+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid base64 format" },
          { status: 400 }
        );
      }
      contentType = match[1];
      const base64Data = match[2];
      const buf = Buffer.from(base64Data, "base64");
      fileData = new Uint8Array(buf);
    } else {
      return NextResponse.json(
        { error: "Provide either url or base64" },
        { status: 400 }
      );
    }

    const filename =
      ("filename" in body && body.filename) || `${crypto.randomUUID()}.png`;
    const path = `generations/${filename}`;

    const { data, error } = await supabaseServer.storage
      .from("ai-images")
      .upload(path, fileData, {
        contentType,
        upsert: false,
      });

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Upload failed" },
        { status: 500 }
      );
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-images/${data.path}`;

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
