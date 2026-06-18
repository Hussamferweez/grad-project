"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import type { UserProfile } from "@/types";

export default function PatientMedicalRecordsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users
      .getProfile()
      .then(setProfile)
      .catch((err) => toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load record."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medical Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {profile?.medicalNotes || "No medical notes recorded by the clinic yet."}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Date of Birth" value={profile?.dateOfBirth} />
          <Detail label="Gender" value={profile?.gender} />
          <Detail label="Phone" value={profile?.phoneNumber} />
          <Detail label="Address" value={profile?.address} />
          <Detail label="Emergency Contact" value={profile?.emergencyContact} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Your clinical record is maintained by your clinic. Contact the front desk to update medical information.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}
