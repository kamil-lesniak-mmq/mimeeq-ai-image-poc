import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const allCookies = (await cookies()).getAll();

  const mmq = (await cookies()).get("mmq-user")?.value;

  return NextResponse.json({
    allCookies,
    mmq,
  });
}
