"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, PlusCircle, RefreshCw, Search, Stethoscope, UserRoundCog, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError, type CreateStaffPayload } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import type { BackendRole, UserSummary } from "@/types";

interface StaffFormState {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roleName: CreateStaffPayload["roleName"];
  address: string;
  emergencyContact: string;
}

const emptyForm: StaffFormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  roleName: "Receptionist",
  address: "",
  emergencyContact: ""
};

export default function StaffAccountsPage() {
  const [role, setRole] = useState<BackendRole | null>(null);
  const [doctors, setDoctors] = useState<UserSummary[]>([]);
  const [receptionists, setReceptionists] = useState<UserSummary[]>([]);
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = role === "Admin";
  const staff = useMemo(() => [...doctors, ...receptionists], [doctors, receptionists]);
  const filteredStaff = staff.filter((user) => {
    const text = `${user.fullName} ${user.phoneNumber} ${user.email} ${user.roleName}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorList, receptionistList] = await Promise.all([
        api.users.getByRoleName("Doctor"),
        api.users.getByRoleName("Receptionist")
      ]);
      setDoctors(doctorList);
      setReceptionists(receptionistList);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getClientSession();
    setRole(session?.role ?? null);
    void loadStaff();
  }, [loadStaff]);

  const updateField = (key: keyof StaffFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    try {
      const payload: CreateStaffPayload = {
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        roleName: form.roleName,
        address: form.address.trim() || null,
        emergencyContact: form.emergencyContact.trim() || null
      };

      await api.users.createStaff(payload);
      toast.success(`${form.roleName} account created`);
      setForm(emptyForm);
      await loadStaff();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to create staff account.");
    } finally {
      setSaving(false);
    }
  };

  if (role !== null && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Only admins can create doctor or receptionist accounts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Doctors", value: doctors.length, icon: Stethoscope, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200" },
          { label: "Receptionists", value: receptionists.length, icon: UserRoundCog, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
          { label: "Staff Accounts", value: staff.length, icon: UsersRound, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" }
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

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>New Staff Account</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Create login accounts for doctors and receptionists.</p>
          </div>
          <Badge variant="secondary" className="w-fit rounded-md">
            Admin only
          </Badge>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitStaff} className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role</Label>
              <Select value={form.roleName} onValueChange={(value) => updateField("roleName", value as CreateStaffPayload["roleName"])}>
                <SelectTrigger id="roleName">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receptionist">Receptionist</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={form.username} onChange={(e) => updateField("username", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input id="phoneNumber" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency contact</Label>
              <Input
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={(e) => updateField("emergencyContact", e.target.value)}
              />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div className="flex items-end lg:col-span-1">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Existing Staff</CardTitle>
            <Button variant="outline" onClick={loadStaff} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, email, or role"
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
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No staff accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((user) => (
                    <TableRow key={`${user.roleName}-${user.id}`}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-md">
                          {user.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
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
