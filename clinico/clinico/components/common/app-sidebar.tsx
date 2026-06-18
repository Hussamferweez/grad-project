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
    (i) => i.href !== "/doctor/schedule" || role === "Doctor" || role === "Admin"
  );
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 88 : 260 }}
      className="hidden min-h-screen border-r bg-card/95 p-4 backdrop-blur-lg lg:flex lg:flex-col"
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
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t pt-4">
        <LogoutButton />
      </div>
    </motion.aside>
  );
}
