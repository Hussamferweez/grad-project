// Server-only session helpers. Import this ONLY from server components / route
// handlers (it uses next/headers). Client components must use "@/lib/session".
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/session";
import type { Session } from "@/types";

export async function getServerSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
