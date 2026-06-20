"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, SmilePlus } from "lucide-react";
import { BackendRole, Portal } from "@/types";
import { doctorSidebarItems, patientSidebarItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { LogoutButton } from "@/components/common/logout-button";

interface AppSidebarProps {
  portal: Portal;
  role?: BackendRole;
}

export function AppSidebar({ portal, role }: AppSidebarProps) {
  const pathname = usePathname();
  const items = (portal === "doctor" ? doctorSidebarItems : patientSidebarItems).filter(
    (i) =>
      (i.href !== "/doctor/schedule" || role === "Doctor" || role === "Admin") &&
      (i.href !== "/doctor/staff" || role === "Admin")
  );
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 88 : 260 }}
      className="hidden min-h-screen border-r border-white/10 bg-slate-950 p-4 text-slate-100 shadow-[18px_0_60px_-48px_hsl(218_50%_20%)] lg:flex lg:flex-col"
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo />
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
              <span className="block rounded-lg bg-primary/10 p-2 text-primary">
                <SmilePlus className="h-5 w-5" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-slate-300 hover:bg-white/10 hover:text-white">
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {!sidebarCollapsed && (
        <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs font-semibold uppercase text-slate-400">Clinic workspace</p>
          <p className="mt-1 text-sm font-medium text-slate-100">{role ?? "Staff"}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white text-slate-950 shadow-[0_18px_35px_-25px_hsl(188_80%_55%)]"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
              <span className={cn("rounded-md p-1.5", active ? "bg-primary/10 text-primary" : "bg-white/[0.04]")}>
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <LogoutButton />
      </div>
    </motion.aside>
  );
}
