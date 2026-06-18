import { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/common/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinico - Dental Clinic Management System",
  description: "Modern dental clinic SaaS for doctors and patients"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
