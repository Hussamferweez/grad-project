"use client";

import { motion } from "framer-motion";
import { CalendarCheck2, Clock3, ClipboardList, SquareCheckBig } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalAppointments: number;
}

const cards = [
  { key: "todayAppointments", title: "Today's Appointments", icon: CalendarCheck2, tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200" },
  { key: "pendingAppointments", title: "Pending", icon: Clock3, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" },
  { key: "completedAppointments", title: "Completed", icon: SquareCheckBig, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
  { key: "totalAppointments", title: "Total Appointments", icon: ClipboardList, tone: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200" }
] as const;

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = props[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card className="shadow-sm transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <span className={`rounded-lg p-2 ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                <div className="mt-2 h-1.5 w-20 rounded-full bg-foreground/10">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
