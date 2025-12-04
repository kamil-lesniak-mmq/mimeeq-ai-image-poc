import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { data: existing } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let user = existing;

  if (!user) {
    const { data, error } = await supabaseServer
      .from("users")
      .insert({ email })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "User create failed" },
        { status: 500 }
      );
    }

    user = data;
  }

  const res = NextResponse.json({
    id: user.id,
    email: user.email,
  });

  // ✅ THIS IS CORRECT
  res.cookies.set("mmq-user", String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
