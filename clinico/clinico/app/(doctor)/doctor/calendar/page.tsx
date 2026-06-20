"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, RefreshCw } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { toast } from "sonner";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import type { Appointment, Session } from "@/types";

export default function DoctorCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getClientSession());
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const anchor = selectedDate ?? new Date();
      const data = await api.appointments.getByDate(format(anchor, "yyyy-MM-dd"));
      setAppointments(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load calendar.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, session]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const selectedKey = format(selectedDate ?? new Date(), "yyyy-MM-dd");

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Calendar View</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{format(selectedDate ?? new Date(), "EEEE, MMMM d, yyyy")}</span>
            <Badge variant="secondary" className="rounded-md">
              {appointments.length} appointments
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="calendarDate">Go to date</Label>
            <Input
              id="calendarDate"
              type="date"
              value={selectedKey}
              onChange={(event) => setSelectedDate(new Date(`${event.target.value}T00:00:00`))}
              className="w-[180px]"
            />
          </div>
          <Button variant="outline" onClick={loadCalendar} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  modifiers={{ booked: appointments.map((appointment) => new Date(`${appointment.appointmentDate.slice(0, 10)}T00:00:00`)) }}
                  modifiersClassNames={{ booked: "bg-primary/20 rounded-full font-semibold text-primary" }}
                  classNames={{ caption_label: "font-semibold" }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{format(selectedDate ?? new Date(), "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentsTable appointments={appointments} role={session?.role ?? null} onChanged={loadCalendar} />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
