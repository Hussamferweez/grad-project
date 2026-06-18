"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/types";

export default function DoctorSettingsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  const loadServices = () => {
    api.services
      .getAll()
      .then(setServices)
      .catch((err) => toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load services."));
  };

  useEffect(loadServices, []);

  const addService = async () => {
    if (!name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    setSaving(true);
    try {
      await api.services.create(name.trim(), duration);
      toast.success("Service added");
      setName("");
      setDuration(30);
      loadServices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to add service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProfileSettings />

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Treatments offered by the clinic and their approximate duration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services yet.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground">{service.approximateDurationMinutes} min</span>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Name</Label>
              <Input id="serviceName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cleaning" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceDuration">Minutes</Label>
              <Input
                id="serviceDuration"
                type="number"
                min={1}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addService} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
