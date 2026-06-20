"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, LogOut, Menu, ShieldCheck, Stethoscope, User } from "lucide-react";
import { BackendRole, Portal } from "@/types";
import { doctorSidebarItems, patientSidebarItems } from "@/lib/constants";
import { clearClientSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const titleMap: Record<string, string> = {
  dashboard: "Dashboard",
  appointments: "Appointments",
  "medical-records": "Medical Records",
  calendar: "Calendar",
  patients: "Patients",
  staff: "Staff Accounts",
  schedule: "Schedule",
  settings: "Settings",
  profile: "Profile"
};

export function Topbar({ portal, role, userFullName }: { portal: Portal; role?: BackendRole; userFullName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = (portal === "doctor" ? doctorSidebarItems : patientSidebarItems).filter(
    (i) =>
      (i.href !== "/doctor/schedule" || role === "Doctor" || role === "Admin") &&
      (i.href !== "/doctor/staff" || role === "Admin")
  );
  const namePrefix = role === "Doctor" ? "Dr. " : "";
  const HeaderIcon = portal === "patient" ? User : Stethoscope;
  const today = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date());

  const handleLogout = () => {
    clearClientSession();
    router.push("/login");
    router.refresh();
  };

  const title = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
    return titleMap[segment] ?? (portal === "doctor" ? "Staff Portal" : "Patient Portal");
  }, [pathname, portal]);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 border-b border-white/70 bg-background/72 px-4 py-3 shadow-[0_14px_40px_-34px_hsl(218_45%_18%)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/62 md:px-6 dark:border-white/10"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="hidden h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm md:flex">
            <HeaderIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-semibold text-transparent">
              {title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{userFullName ? `Welcome back, ${namePrefix}${userFullName.split(" ")[0]}` : "Welcome back to Clinico"}</span>
              {role && (
                <Badge variant="secondary" className="gap-1 rounded-md border border-primary/10 bg-primary/10 px-2 py-0.5 text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  {role}
                </Badge>
              )}
              <span className="hidden items-center gap-1 md:inline-flex">
                <CalendarDays className="h-3.5 w-3.5" />
                {today}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userFullName && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur md:flex dark:bg-background/60">
                <HeaderIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {namePrefix}{userFullName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full lg:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
