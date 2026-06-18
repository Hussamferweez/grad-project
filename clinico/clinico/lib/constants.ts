import { CalendarDays, Clock, FileText, LayoutDashboard, Settings, Stethoscope, User } from "lucide-react";

// Sidebar navigation. Only pages backed by a real API endpoint are listed —
// the old billing / dental-chart / payments / patient-CRM pages were removed
// because the backend has no matching endpoints.

export const doctorSidebarItems = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
  { label: "Calendar", href: "/doctor/calendar", icon: Stethoscope },
  { label: "Schedule", href: "/doctor/schedule", icon: Clock },
  { label: "Settings", href: "/doctor/settings", icon: Settings }
];

export const patientSidebarItems = [
  { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { label: "My Appointments", href: "/patient/appointments", icon: CalendarDays },
  { label: "My Medical Record", href: "/patient/medical-records", icon: FileText },
  { label: "Profile Settings", href: "/patient/profile", icon: User }
];
