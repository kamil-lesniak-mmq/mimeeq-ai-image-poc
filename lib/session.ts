import { cookies } from "next/headers";

const COOKIE_NAME = "mmq-user";

export async function getSessionUserId(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

export async function setSessionUserId(userId: string) {
  (await cookies()).set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionUserId() {
  (await cookies()).delete(COOKIE_NAME);
}
