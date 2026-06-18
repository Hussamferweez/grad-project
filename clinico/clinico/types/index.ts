// ─────────────────────────────────────────────────────────────────────────────
// Types mirroring the Clinco .NET API (DTOs serialized as camelCase JSON).
// The Supabase data model has been fully removed.
// ─────────────────────────────────────────────────────────────────────────────

/** Roles as defined by the backend (JWT role claim / AuthResponse.role). */
export type BackendRole = "Admin" | "Doctor" | "Receptionist" | "Patient";

/** Which front-end portal a user lands in. Derived from the backend role. */
export type Portal = "doctor" | "patient";

/** Appointment status strings as serialized by the backend enum. */
export type AppointmentStatus = "Booked" | "Confirmed" | "Delayed" | "Completed" | "Cancelled";

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Raw payload returned by POST /api/Auth/login and /register (inside ApiResponse.data). */
export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  email: string;
  role: BackendRole;
}

/** The locally-persisted session (stored in a readable cookie). */
export interface Session {
  token: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  email: string;
  role: BackendRole;
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string;
  address: string | null;
  emergencyContact: string | null;
  medicalNotes: string | null;
  roleName: string;
  isActive: boolean;
  registrationDate: string;
  lastLogin: string | null;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  isActive: boolean;
}

// ── Service ─────────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  name: string;
  approximateDurationMinutes: number;
}

// ── Schedule ────────────────────────────────────────────────────────────────────

export interface Schedule {
  id: number;
  dentistId: number;
  dentistName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  date: string;
}

// ── Appointment ─────────────────────────────────────────────────────────────────

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  dentistId: number;
  dentistName: string;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm
  durationMinutes: number;
  serviceName: string;
  status: AppointmentStatus;
  treatmentNotes: string | null;
  delayReason: string | null;
  delayDurationMinutes: number;
  estimatedEndTime: string; // HH:mm
  createdAt: string;
  updatedAt: string;
}

// ── SMS Notification ────────────────────────────────────────────────────────────

export interface SmsNotification {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  messageType: string;
  messageContent: string;
  status: string;
  externalMessageId: string | null;
  failureReason: string | null;
  createdAt: string;
  sentAt: string | null;
}
