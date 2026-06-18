import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession, homeForRole } from "@/lib/session";
import { isStaffRole } from "@/lib/auth-role";

const doctorRoutes = ["/doctor"];
const patientRoutes = ["/patient"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const role = session?.role ?? null;

  const isDoctorRoute = doctorRoutes.some((r) => path.startsWith(r));
  const isPatientRoute = patientRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  // Not signed in → protect both portals.
  if (!role) {
    if (isDoctorRoute || isPatientRoute) return redirectTo("/login");
    return NextResponse.next();
  }

  // Clinic staff (Doctor / Receptionist / Admin) may enter the staff portal.
  if (isDoctorRoute && !isStaffRole(role)) return redirectTo(homeForRole(role));

  // Only Patient may enter the patient portal.
  if (isPatientRoute && role !== "Patient") return redirectTo(homeForRole(role));

  // Signed-in users shouldn't see the login / register pages.
  if (isAuthRoute) return redirectTo(homeForRole(role));

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/login", "/register"]
};
