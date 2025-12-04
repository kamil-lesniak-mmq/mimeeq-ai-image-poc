import { NextResponse } from "next/server";
import { clearSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export async function POST() {
  clearSessionUserId();
  return redirect('/auth/login');
}
