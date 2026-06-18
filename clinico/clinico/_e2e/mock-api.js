// Contract-faithful mock of the Clinco .NET API for end-to-end browser testing.
// Mirrors routes, the { succeeded, data, errors } envelope, DTO shapes (camelCase),
// ProblemDetails errors, AND the real role-based authorization (so Doctor gets the
// same 403s the real backend would return). In-memory only. No deps.

const http = require("http");

const PORT = 5098;
const pad = (n) => String(n).padStart(2, "0");
const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const now = new Date();
const today = dateStr(now);
const tomorrow = dateStr(new Date(now.getTime() + 864e5));
const nextWeek = dateStr(new Date(now.getTime() + 7 * 864e5));
const yesterday = dateStr(new Date(now.getTime() - 864e5));
const iso = (d) => new Date(d).toISOString();

// ── Seed data ─────────────────────────────────────────────────────────────────
const users = [
  {
    id: 1, username: "drsmith", firstName: "John", lastName: "Smith",
    email: "doctor@clinico.com", phoneNumber: "+201000000001", password: "Password1",
    role: "Doctor", dateOfBirth: "1980-05-10", gender: "Male", address: "1 Clinic Street",
    emergencyContact: "+201000000999", medicalNotes: null, isActive: true,
    registrationDate: "2026-01-01T09:00:00Z", lastLogin: null
  },
  {
    id: 2, username: "monaali", firstName: "Mona", lastName: "Ali",
    email: "patient@clinico.com", phoneNumber: "+201000000002", password: "Password1",
    role: "Patient", dateOfBirth: "1995-03-22", gender: "Female", address: "5 Nile Road",
    emergencyContact: "+201000000888", medicalNotes: "Allergic to penicillin. Mild hypertension.",
    isActive: true, registrationDate: "2026-02-15T10:00:00Z", lastLogin: null
  },
  {
    id: 4, username: "reception", firstName: "Rita", lastName: "Fox",
    email: "reception@clinico.com", phoneNumber: "+201000000004", password: "Password1",
    role: "Receptionist", dateOfBirth: "1990-01-01", gender: "Female", address: "Front Desk",
    emergencyContact: null, medicalNotes: null, isActive: true,
    registrationDate: "2026-01-01T09:00:00Z", lastLogin: null
  }
];
let nextUserId = 5;

const services = [
  { id: 1, name: "Cleaning", approximateDurationMinutes: 30 },
  { id: 2, name: "Root Canal", approximateDurationMinutes: 60 },
  { id: 3, name: "Whitening", approximateDurationMinutes: 45 }
];
let nextServiceId = 4;

const appt = (id, date, time, service, dur, status, end) => ({
  id, patientId: 2, patientName: "Mona Ali", dentistId: 1, dentistName: "John Smith",
  appointmentDate: date, appointmentTime: time, durationMinutes: dur, serviceName: service,
  status, treatmentNotes: null, delayReason: null, delayDurationMinutes: 0,
  estimatedEndTime: end, createdAt: iso(now), updatedAt: iso(now)
});
let appointments = [
  appt(101, today, "10:00", "Cleaning", 30, "Confirmed", "10:30"),
  appt(102, tomorrow, "14:00", "Root Canal", 60, "Booked", "15:00"),
  appt(103, nextWeek, "09:30", "Whitening", 45, "Booked", "10:15"),
  appt(104, yesterday, "11:00", "Cleaning", 30, "Completed", "11:30")
];
let nextApptId = 105;

let schedules = [
  { id: 201, dentistId: 1, dentistName: "John Smith", dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true, date: today },
  { id: 202, dentistId: 1, dentistName: "John Smith", dayOfWeek: "Tuesday", startTime: "10:00", endTime: "13:00", isAvailable: false, date: tomorrow }
];
let nextScheduleId = 203;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toProfile(u) {
  return {
    id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName,
    fullName: `${u.firstName} ${u.lastName}`, email: u.email, phoneNumber: u.phoneNumber,
    dateOfBirth: u.dateOfBirth, gender: u.gender, address: u.address,
    emergencyContact: u.emergencyContact, medicalNotes: u.medicalNotes, roleName: u.role,
    isActive: u.isActive, registrationDate: u.registrationDate, lastLogin: u.lastLogin
  };
}
function authResponse(u) {
  return {
    accessToken: `acc-${u.id}-${Date.now()}`, refreshToken: `ref-${u.id}`,
    expiresAt: new Date(Date.now() + 3600e3).toISOString(),
    userId: u.id, fullName: `${u.firstName} ${u.lastName}`, email: u.email, role: u.role
  };
}
function userFromAuth(req) {
  const h = req.headers["authorization"] || "";
  const m = h.match(/^Bearer\s+acc-(\d+)-/);
  if (!m) return null;
  return users.find((u) => u.id === Number(m[1])) || null;
}
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Max-Age": "86400"
};
function send(res, status, body, raw) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { ...cors, "Content-Type": raw ? "application/json" : "application/json" });
  res.end(payload);
}
const ok = (res, data, status = 200) => send(res, status, { succeeded: true, data, errors: null });
const okRaw = (res, data) => send(res, 200, data, true);
const noContent = (res) => { res.writeHead(204, cors); res.end(); };
const problem = (res, status, title, errors) =>
  send(res, status, { status, title, errors: errors || [title] });

// ── Router ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  const q = url.searchParams;
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    try { route(req.method, p, q, body, req, res); }
    catch (e) { problem(res, 500, "Server error", [String(e)]); }
  });
});

function route(method, p, q, body, req, res) {
  // ── Auth ──
  if (method === "POST" && p === "/api/Auth/login") {
    const u = users.find((x) => x.email === body.identifier || x.phoneNumber === body.identifier);
    if (!u || u.password !== body.password) return problem(res, 401, "Unauthorized", ["Invalid credentials."]);
    u.lastLogin = new Date().toISOString();
    return ok(res, authResponse(u));
  }
  if (method === "POST" && p === "/api/Auth/register") {
    if (users.some((x) => x.email === body.email))
      return problem(res, 409, "Conflict", ["A user with this email or phone number already exists."]);
    const u = {
      id: nextUserId++, username: body.username, firstName: body.firstName, lastName: body.lastName,
      email: body.email, phoneNumber: body.phoneNumber, password: body.password, role: "Patient",
      dateOfBirth: body.dateOfBirth || null, gender: "Other", address: body.address || null,
      emergencyContact: null, medicalNotes: null, isActive: true,
      registrationDate: new Date().toISOString(), lastLogin: null
    };
    users.push(u);
    return ok(res, authResponse(u), 201);
  }
  if (method === "POST" && p === "/api/Auth/refresh") {
    const m = String(body.refreshToken || "").match(/^ref-(\d+)$/);
    const u = m && users.find((x) => x.id === Number(m[1]));
    if (!u) return problem(res, 401, "Unauthorized", ["Invalid or expired refresh token."]);
    return ok(res, authResponse(u));
  }

  // Everything below requires auth
  const me = userFromAuth(req);
  if (!me) return problem(res, 401, "Unauthorized", ["Authentication required."]);

  // ── Auth (authenticated) ──
  if (method === "POST" && p === "/api/Auth/logout") return noContent(res);

  // ── Users ──
  if (method === "GET" && p === "/api/Users/profile") return ok(res, toProfile(me));
  const roleMatch = p.match(/^\/api\/Users\/role\/([^/]+)$/);
  if (method === "GET" && roleMatch) {
    const roleName = decodeURIComponent(roleMatch[1]);
    const list = users
      .filter((u) => u.role === roleName)
      .map((u) => ({ id: u.id, fullName: `${u.firstName} ${u.lastName}`, email: u.email, phoneNumber: u.phoneNumber, roleName: u.role, isActive: u.isActive }));
    return ok(res, list);
  }
  if (method === "PUT" && p === "/api/Users/profile") {
    me.firstName = body.firstName ?? me.firstName;
    me.lastName = body.lastName ?? me.lastName;
    me.phoneNumber = body.phoneNumber ?? me.phoneNumber;
    me.address = body.address ?? null;
    me.emergencyContact = body.emergencyContact ?? null;
    return noContent(res);
  }
  if (method === "PUT" && p === "/api/Users/change-password") {
    if (body.currentPassword !== me.password) return problem(res, 401, "Unauthorized", ["Current password is incorrect."]);
    me.password = body.newPassword;
    return noContent(res);
  }

  // ── Services ──
  if (method === "GET" && p === "/api/Services") return okRaw(res, services); // raw array (no envelope)
  if (method === "POST" && p === "/api/Services") {
    services.push({ id: nextServiceId++, name: body.name, approximateDurationMinutes: body.approximateDurationMinutes });
    return send(res, 200, undefined);
  }

  // ── Appointments ──
  let m;
  if (method === "GET" && p === "/api/Appointments/my") {
    if (me.role !== "Patient") return problem(res, 403, "Forbidden", ["Patients only."]);
    return ok(res, appointments.filter((a) => a.patientId === me.id));
  }
  if ((m = p.match(/^\/api\/Appointments\/dentist\/(\d+)$/)) && method === "GET") {
    const did = Number(m[1]); const date = q.get("date");
    let list = appointments.filter((a) => a.dentistId === did);
    if (date) list = list.filter((a) => a.appointmentDate === date);
    return ok(res, list);
  }
  if ((m = p.match(/^\/api\/Appointments\/date\/([\d-]+)$/)) && method === "GET") {
    // Clinic staff (Doctor/Receptionist/Admin) — all appointments on the date.
    return ok(res, appointments.filter((a) => a.appointmentDate === m[1]));
  }
  if (method === "POST" && p === "/api/Appointments/manage/book") {
    if (!["Receptionist", "Admin"].includes(me.role))
      return problem(res, 403, "Forbidden", ["Receptionist or Admin role required to book."]);
    const svc = services.find((s) => s.id === Number(body.serviceId));
    const a = appt(nextApptId++, body.appointmentDate, body.appointmentTime, svc ? svc.name : "Service",
      svc ? svc.approximateDurationMinutes : 30, "Booked", body.appointmentTime);
    a.patientId = Number(body.patientId); a.dentistId = Number(body.dentistId);
    appointments.push(a);
    return ok(res, a, 201);
  }
  if ((m = p.match(/^\/api\/Appointments\/(\d+)$/)) && method === "PUT") {
    if (!["Receptionist", "Admin"].includes(me.role))
      return problem(res, 403, "Forbidden", ["Receptionist or Admin role required."]);
    const a = appointments.find((x) => x.id === Number(m[1]));
    if (!a) return problem(res, 404, "Not found", ["Appointment not found."]);
    const action = (body.action || "").toLowerCase();
    if (action === "confirm") a.status = "Confirmed";
    else if (action === "complete") a.status = "Completed";
    else if (action === "reschedule") { a.appointmentDate = body.newDate; a.appointmentTime = body.newTime; a.status = "Booked"; }
    return ok(res, a);
  }
  if ((m = p.match(/^\/api\/Appointments\/(\d+)\/cancel$/)) && method === "PATCH") {
    const a = appointments.find((x) => x.id === Number(m[1]));
    if (!a) return problem(res, 404, "Not found", ["Appointment not found."]);
    if (me.role === "Patient" && a.patientId !== me.id) return problem(res, 403, "Forbidden", ["Not your appointment."]);
    a.status = "Cancelled";
    return noContent(res);
  }

  // ── Delays ──
  if (method === "POST" && p === "/api/Delays") {
    if (!["Doctor", "Admin"].includes(me.role)) return problem(res, 403, "Forbidden", ["Doctor or Admin required."]);
    const a = appointments.find((x) => x.id === Number(body.appointmentId));
    if (!a) return problem(res, 404, "Not found", ["Appointment not found."]);
    a.status = "Delayed"; a.delayReason = body.reason; a.delayDurationMinutes = body.delayDurationMinutes;
    return ok(res, a);
  }

  // ── Schedules ──
  if ((m = p.match(/^\/api\/Schedules\/dentist\/(\d+)$/)) && method === "GET") {
    const did = Number(m[1]); const from = q.get("from"); const to = q.get("to");
    let list = schedules.filter((s) => s.dentistId === did);
    if (from) list = list.filter((s) => s.date >= from);
    if (to) list = list.filter((s) => s.date <= to);
    return ok(res, list);
  }
  if (method === "POST" && p === "/api/Schedules") {
    if (!["Doctor", "Admin"].includes(me.role)) return problem(res, 403, "Forbidden", ["Doctor or Admin required."]);
    const s = {
      id: nextScheduleId++, dentistId: Number(body.dentistId), dentistName: `${me.firstName} ${me.lastName}`,
      dayOfWeek: body.dayOfWeek, startTime: body.startTime, endTime: body.endTime,
      isAvailable: body.isAvailable !== false, date: body.date
    };
    schedules.push(s);
    return ok(res, { id: s.id }, 201);
  }
  if ((m = p.match(/^\/api\/Schedules\/(\d+)\/availability$/)) && method === "PATCH") {
    if (me.role !== "Admin") return problem(res, 403, "Forbidden", ["Admin role required."]);
    const s = schedules.find((x) => x.id === Number(m[1]));
    if (!s) return problem(res, 404, "Not found", ["Schedule not found."]);
    s.isAvailable = body.isAvailable;
    return noContent(res);
  }

  return problem(res, 404, "Not found", [`No route for ${method} ${p}`]);
}

server.listen(PORT, () => console.log(`mock-api listening on http://localhost:${PORT}`));
