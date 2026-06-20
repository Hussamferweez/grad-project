import { CalendarDays, Clock, LayoutDashboard, Settings, Stethoscope } from "lucide-react";

// Sidebar navigation. This app is for clinic staff only: Receptionist and Doctor.
export const doctorSidebarItems = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
  { label: "Calendar", href: "/doctor/calendar", icon: Stethoscope },
  { label: "Schedule", href: "/doctor/schedule", icon: Clock },
  { label: "Settings", href: "/doctor/settings", icon: Settings }
];
