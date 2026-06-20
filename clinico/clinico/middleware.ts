import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession, homeForRole } from "@/lib/session";
import { isStaffRole } from "@/lib/auth-role";

const staffRoutes = ["/doctor"];
const authRoutes = ["/login"];
const disabledRoutes = ["/patient", "/register"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const role = session?.role ?? null;

  const isStaffRoute = staffRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));
  const isDisabledRoute = disabledRoutes.some((r) => path.startsWith(r));

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  if (isDisabledRoute) {
    return redirectTo(role && isStaffRole(role) ? "/doctor/dashboard" : "/login");
  }

  if (!role) {
    if (isStaffRoute) return redirectTo("/login");
    return NextResponse.next();
  }

  if (isStaffRoute && !isStaffRole(role)) return redirectTo(homeForRole(role));
  if (isAuthRoute) return redirectTo(homeForRole(role));

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/login", "/register"]
};
