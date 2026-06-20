"use client";

import { useCallback, useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentStatusBadge } from "@/lib/auth-role";
import type { Appointment } from "@/types";

const dateKey = (value: string) => value.slice(0, 10);

interface AppointmentCalendarProps {
  appointments: Appointment[];
  /** Whose name to show on each entry. Defaults to the patient. */
  perspective?: "patient" | "dentist";
  selected?: Date;
  onSelectedChange?: (date: Date | undefined) => void;
}

export function AppointmentCalendar({
  appointments,
  perspective = "patient",
  selected: controlledSelected,
  onSelectedChange
}: AppointmentCalendarProps) {
  const [localSelected, setLocalSelected] = useState<Date | undefined>(new Date());
  const selected = controlledSelected ?? localSelected;
  const parseDate = useCallback((value: string) => new Date(`${dateKey(value)}T00:00:00`), []);

  const appointmentDates = useMemo(
    () => appointments.map((a) => parseDate(a.appointmentDate)),
    [appointments, parseDate]
  );
  const selectedAppointments = useMemo(() => {
    if (!selected) return [];
    return appointments.filter((item) => isSameDay(parseDate(item.appointmentDate), selected));
  }, [appointments, parseDate, selected]);
  const timeSlots = useMemo(() => {
    const base = Array.from({ length: 11 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);
    const actual = selectedAppointments.map((appointment) => `${appointment.appointmentTime.slice(0, 2)}:00`);
    return Array.from(new Set([...base, ...actual])).sort();
  }, [selectedAppointments]);

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              setLocalSelected(date);
              onSelectedChange?.(date);
            }}
            modifiers={{ booked: appointmentDates }}
            modifiersClassNames={{ booked: "bg-primary/20 rounded-full font-semibold text-primary" }}
            classNames={{ caption_label: "font-semibold" }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selected ? format(selected, "EEEE, MMMM d, yyyy") : "Appointments"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments for this day.</p>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const slotHour = slot.slice(0, 2);
                const slotAppointments = selectedAppointments.filter(
                  (appointment) => appointment.appointmentTime.slice(0, 2) === slotHour
                );
                return (
                  <div key={slot} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[80px_1fr]">
                    <p className="text-sm font-medium text-muted-foreground">{slot}</p>
                    <div className="space-y-2">
                      {slotAppointments.length === 0 ? (
                        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">Available</p>
                      ) : (
                        slotAppointments.map((appointment) => (
                          <div key={appointment.id} className="rounded-md border bg-primary/5 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {perspective === "dentist" ? appointment.dentistName : appointment.patientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {perspective === "dentist" ? appointment.patientName : appointment.dentistName}
                                </p>
                                <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{appointment.appointmentTime}</p>
                                <Badge variant={appointmentStatusBadge(appointment.status)}>{appointment.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
