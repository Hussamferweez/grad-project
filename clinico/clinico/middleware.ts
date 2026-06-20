import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession, homeForRole } from "@/lib/session";
import { isStaffRole } from "@/lib/auth-role";

const staffRoutes = ["/doctor"];
const retiredRoutes = ["/patient", "/register"];
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const role = session?.role ?? null;

  const isStaffRoute = staffRoutes.some((r) => path.startsWith(r));
  const isRetiredRoute = retiredRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  const redirectTo = (pathname: string, clearSession = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url);
    if (clearSession) response.cookies.delete(SESSION_COOKIE);
    return response;
  };

  if (isRetiredRoute) return redirectTo("/login", true);

  if (!role) {
    if (isStaffRoute) return redirectTo("/login");
    return NextResponse.next();
  }

  if (!isStaffRole(role)) return redirectTo("/login", true);

  if (isAuthRoute) return redirectTo(homeForRole(role));

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/login", "/register"]
};
