// ─────────────────────────────────────────────────────────────────────────────
// Typed client for the Clinco .NET API. Replaces every Supabase call.
//
// Response handling:
//   • Most endpoints wrap results in ApiResponse<T> = { succeeded, data, errors }
//     — we unwrap and return `data`.
//   • A few (GET /api/Services) return the raw payload — returned as-is.
//   • 204 / empty bodies return undefined.
//   • Errors come back as ProblemDetails { status, title, errors[] } or as a
//     failed ApiResponse — both are normalised into ApiError.
//
// Auth: on the client the JWT is read from the session cookie automatically.
// On the server, pass `{ token }` (obtained via getServerSession()).
// ─────────────────────────────────────────────────────────────────────────────

import { getClientSession } from "@/lib/session";
import type {
  Appointment,
  AuthResponse,
  Schedule,
  Service,
  SmsNotification,
  UserProfile,
  UserSummary
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5098";

export class ApiError extends Error {
  status: number;
  errors: string[];
  constructor(status: number, errors: string[], message?: string) {
    super(message ?? errors[0] ?? `Request failed (${status}).`);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors.length ? errors : [this.message];
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Explicit bearer token (required for server-side calls). */
  token?: string | null;
  /** Skip attaching the Authorization header entirely (login / register). */
  anonymous?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildQuery(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractErrors(payload: unknown, fallback: string): string[] {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.errors)) return obj.errors.map(String);
    if (typeof obj.title === "string") return [obj.title];
    if (typeof obj.message === "string") return [obj.message];
  }
  return [fallback];
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, anonymous, query } = options;
  const token = anonymous ? null : options.token ?? getClientSession()?.token ?? null;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(408, ["The request timed out. Please try again."]);
    }
    throw new ApiError(0, ["Network error — could not reach the server."]);
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, extractErrors(payload, res.statusText || "Request failed."));
  }

  // Unwrap ApiResponse<T> envelope when present.
  if (payload && typeof payload === "object" && "succeeded" in payload) {
    const env = payload as { succeeded: boolean; data: T; errors?: string[] | null };
    if (!env.succeeded) throw new ApiError(res.status, env.errors ?? ["Request failed."]);
    return env.data;
  }

  return payload as T;
}

// ── Request payload shapes ────────────────────────────────────────────────────

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth?: string | null;
  address?: string | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: string | null;
  emergencyContact?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface BookAppointmentPayload {
  patientId: number;
  dentistId: number;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm
  serviceId: number;
  createdBy: number;
  scheduleId?: number | null;
}

export type ManageAction = "confirm" | "reschedule" | "complete";

export interface ManageAppointmentPayload {
  action: ManageAction;
  newDate?: string | null;
  newTime?: string | null;
  serviceName?: string | null;
}

export interface CreateSchedulePayload {
  dentistId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable?: boolean;
}

export interface MarkDelayPayload {
  appointmentId: number;
  delayDurationMinutes: number;
  reason: string;
}

// ── Endpoint groups ───────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (payload: LoginPayload) =>
      apiRequest<AuthResponse>("/api/Auth/login", { method: "POST", body: payload, anonymous: true }),
    register: (payload: RegisterPayload) =>
      apiRequest<AuthResponse>("/api/Auth/register", { method: "POST", body: payload, anonymous: true })
  },

  users: {
    getProfile: (token?: string) => apiRequest<UserProfile>("/api/Users/profile", { token }),
    updateProfile: (payload: UpdateProfilePayload, token?: string) =>
      apiRequest<void>("/api/Users/profile", { method: "PUT", body: payload, token }),
    changePassword: (payload: ChangePasswordPayload, token?: string) =>
      apiRequest<void>("/api/Users/change-password", { method: "PUT", body: payload, token }),
    getAll: (token?: string) => apiRequest<UserSummary[]>("/api/Users", { token }),
    getByRole: (roleId: number, token?: string) =>
      apiRequest<UserSummary[]>(`/api/Users/by-role/${roleId}`, { token }),
    getByRoleName: (roleName: string, token?: string) =>
      apiRequest<UserSummary[]>(`/api/Users/role/${encodeURIComponent(roleName)}`, { token }),
    getById: (id: number, token?: string) => apiRequest<UserProfile>(`/api/Users/${id}`, { token })
  },

  appointments: {
    getById: (id: number, token?: string) => apiRequest<Appointment>(`/api/Appointments/${id}`, { token }),
    getMine: (token?: string) => apiRequest<Appointment[]>("/api/Appointments/my", { token }),
    getByPatient: (patientId: number, token?: string) =>
      apiRequest<Appointment[]>(`/api/Appointments/patient/${patientId}`, { token }),
    getByDate: (date: string, token?: string) =>
      apiRequest<Appointment[]>(`/api/Appointments/date/${date}`, { token }),
    getByDentist: (dentistId: number, date?: string, token?: string) =>
      apiRequest<Appointment[]>(`/api/Appointments/dentist/${dentistId}`, { query: { date }, token }),
    book: (payload: BookAppointmentPayload, token?: string) =>
      apiRequest<Appointment>("/api/Appointments/manage/book", { method: "POST", body: payload, token }),
    manage: (id: number, payload: ManageAppointmentPayload, token?: string) =>
      apiRequest<Appointment>(`/api/Appointments/${id}`, { method: "PUT", body: payload, token }),
    cancel: (id: number, token?: string) =>
      apiRequest<void>(`/api/Appointments/${id}/cancel`, { method: "PATCH", token })
  },

  schedules: {
    getByDentist: (dentistId: number, from: string, to: string, token?: string) =>
      apiRequest<Schedule[]>(`/api/Schedules/dentist/${dentistId}`, { query: { from, to }, token }),
    getAvailable: (from: string, to: string, token?: string) =>
      apiRequest<Schedule[]>("/api/Schedules/available", { query: { from, to }, token }),
    create: (payload: CreateSchedulePayload, token?: string) =>
      apiRequest<{ id: number }>("/api/Schedules", { method: "POST", body: payload, token }),
    updateAvailability: (id: number, isAvailable: boolean, token?: string) =>
      apiRequest<void>(`/api/Schedules/${id}/availability`, { method: "PATCH", body: { isAvailable }, token })
  },

  services: {
    getAll: (token?: string) => apiRequest<Service[]>("/api/Services", { token }),
    create: (name: string, approximateDurationMinutes: number, token?: string) =>
      apiRequest<void>("/api/Services", { method: "POST", body: { name, approximateDurationMinutes }, token })
  },

  delays: {
    mark: (payload: MarkDelayPayload, token?: string) =>
      apiRequest<Appointment>("/api/Delays", { method: "POST", body: payload, token })
  },

  notifications: {
    notifyDelay: (date: string, delayMessage: string, token?: string) =>
      apiRequest<{ notified: number }>("/api/Notifications/notify-delay", {
        method: "POST",
        body: { date, delayMessage },
        token
      }),
    getByAppointment: (appointmentId: number, token?: string) =>
      apiRequest<SmsNotification[]>(`/api/Notifications/appointment/${appointmentId}`, { token }),
    getByPatient: (patientId: number, token?: string) =>
      apiRequest<SmsNotification[]>(`/api/Notifications/patient/${patientId}`, { token })
  }
};
