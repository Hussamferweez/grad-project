import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required")
});

// Mirrors RegisterPatientCommand validation on the backend.
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a digit"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phoneNumber: z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
  address: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal(""))
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a digit"),
    confirmPassword: z.string().min(1, "Confirm your new password")
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

// ── Appointment booking (staff) ────────────────────────────────────────────────

export const bookAppointmentSchema = z.object({
  patientId: z.coerce.number().int().positive("Patient ID is required"),
  dentistId: z.coerce.number().int().positive("Dentist ID is required"),
  serviceId: z.coerce.number().int().positive("Select a service"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  scheduleId: z.coerce.number().int().positive().optional()
}).refine((v) => v.date >= new Date().toISOString().slice(0, 10), {
  message: "Date cannot be in the past",
  path: ["date"]
});

// ── Schedule (dentist working hours / availability) ────────────────────────────

export const createScheduleSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    isAvailable: z.boolean()
  })
  .refine((v) => v.date >= new Date().toISOString().slice(0, 10), {
    message: "Date cannot be in the past",
    path: ["date"]
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "End time must be after start time",
    path: ["endTime"]
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type BookAppointmentSchema = z.infer<typeof bookAppointmentSchema>;
export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
