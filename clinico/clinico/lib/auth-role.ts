import type { AppointmentStatus, BackendRole, Portal } from "@/types";

export const BACKEND_ROLES: BackendRole[] = ["Admin", "Doctor", "Receptionist", "Patient"];

export function isBackendRole(value: unknown): value is BackendRole {
  return typeof value === "string" && (BACKEND_ROLES as string[]).includes(value);
}

/** Clinic-staff roles that share the staff portal. */
export const isStaffRole = (r?: BackendRole | null): boolean =>
  r === "Doctor" || r === "Receptionist" || r === "Admin";

/** Which portal a backend role uses. Patients do not have system access. */
export function portalForRole(role: BackendRole): Portal {
  void role;
  return "doctor";
}

// ── Capability checks — mirror the backend authorization policies so the UI only
//    ever shows actions the current role can actually perform. ────────────────────
export const canBookAppointment = (r?: BackendRole | null) => r === "Receptionist" || r === "Admin";
/** confirm / reschedule / complete */
export const canManageAppointment = (r?: BackendRole | null) => r === "Receptionist" || r === "Admin";
export const canCancelAppointment = (r?: BackendRole | null) => isStaffRole(r);
export const canMarkDelay = (r?: BackendRole | null) => isStaffRole(r);
export const canCreateSchedule = (r?: BackendRole | null) => r === "Doctor" || r === "Admin";
export const canToggleAvailability = (r?: BackendRole | null) => r === "Admin";

export type StatusBadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline";

/** Maps an appointment status to a Badge variant. Shared across appointment views. */
export function appointmentStatusBadge(status: AppointmentStatus): StatusBadgeVariant {
  switch (status) {
    case "Confirmed":
      return "default";
    case "Completed":
      return "success";
    case "Delayed":
      return "warning";
    case "Cancelled":
      return "danger";
    case "Booked":
    default:
      return "secondary";
  }
}

/**
 * Combines a yyyy-MM-dd date and HH:mm time into a Date for display/sorting.
 * Defensive against malformed values so server components never crash on bad data.
 */
export function appointmentDateTime(appointmentDate: string, appointmentTime: string): Date {
  const time = appointmentTime && appointmentTime.length === 5 ? `${appointmentTime}:00` : appointmentTime || "00:00:00";
  const d = new Date(`${appointmentDate}T${time}`);
  if (!Number.isNaN(d.getTime())) return d;
  const dateOnly = new Date(appointmentDate);
  return Number.isNaN(dateOnly.getTime()) ? new Date(0) : dateOnly;
}
