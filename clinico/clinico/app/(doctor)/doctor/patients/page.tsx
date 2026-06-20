"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ClipboardList, Loader2, PhoneCall, PlusCircle, RefreshCw, Search, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, type CreatePatientPayload } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import type { BackendRole, UserSummary } from "@/types";

type GenderValue = CreatePatientPayload["gender"];

interface PatientFormState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  age: string;
  dateOfBirth: string;
  gender: GenderValue;
  address: string;
  emergencyContact: string;
  medicalNotes: string;
}

const emptyForm: PatientFormState = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  age: "",
  dateOfBirth: "",
  gender: "Male",
  address: "",
  emergencyContact: "",
  medicalNotes: ""
};

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "";

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) age -= 1;

  return age >= 0 && age <= 130 ? String(age) : "";
}

export default function PatientsPage() {
  const [role, setRole] = useState<BackendRole | null>(null);
  const [patients, setPatients] = useState<UserSummary[]>([]);
  const [form, setForm] = useState<PatientFormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canCreate = useMemo(() => role === "Receptionist" || role === "Admin", [role]);
  const activeCount = patients.filter((patient) => patient.isActive).length;
  const phoneCoverage = patients.filter((patient) => patient.phoneNumber).length;
  const filteredPatients = patients.filter((patient) => {
    const text = `${patient.fullName} ${patient.phoneNumber} ${patient.email}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.getByRoleName("Patient");
      setPatients(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRole(getClientSession()?.role ?? null);
    void loadPatients();
  }, [loadPatients]);

  const updateField = (key: keyof PatientFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateDateOfBirth = (value: string) => {
    setForm((current) => ({
      ...current,
      dateOfBirth: value,
      age: value ? calculateAge(value) : ""
    }));
  };

  const submitPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) return;

    setSaving(true);
    try {
      const payload: CreatePatientPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        email: form.email.trim() || null,
        age: form.age ? Number(form.age) : null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address.trim() || null,
        emergencyContact: form.emergencyContact.trim() || null,
        medicalNotes: form.medicalNotes.trim() || null
      };

      await api.users.createPatient(payload);
      toast.success("Patient record created");
      setForm(emptyForm);
      await loadPatients();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to create patient.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Total Patients", value: patients.length, icon: UsersRound, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200" },
          { label: "Active Records", value: activeCount, icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
          { label: "Phone Contacts", value: phoneCoverage, icon: PhoneCall, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
                <span className={`rounded-xl p-2 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canCreate && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>New Patient</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Create a patient record for appointments and clinical notes.</p>
            </div>
            <Badge variant="secondary" className="w-fit gap-1 rounded-md">
              <ClipboardList className="h-3.5 w-3.5" />
              Record only, no portal access
            </Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitPatient} className="grid gap-4 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input id="phoneNumber" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => updateDateOfBirth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={130}
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  readOnly={Boolean(form.dateOfBirth)}
                  className={form.dateOfBirth ? "bg-muted text-muted-foreground" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(value) => updateField("gender", value as GenderValue)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency contact</Label>
                <Input
                  id="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) => updateField("emergencyContact", e.target.value)}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="medicalNotes">Medical notes</Label>
                <Textarea id="medicalNotes" value={form.medicalNotes} onChange={(e) => updateField("medicalNotes", e.target.value)} />
              </div>
              <div className="lg:col-span-4">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Create patient
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Patient Records</CardTitle>
            <Button variant="outline" onClick={loadPatients} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, or email"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        <Badge variant={patient.isActive ? "success" : "secondary"}>
                          {patient.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
