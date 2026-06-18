"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck2, Clock3, ShieldCheck, SmilePlus, Sparkles, Star, Stethoscope, Users, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { clearClientSession, getClientSession, homeForRole } from "@/lib/session";
import type { Session } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const services = [
  {
    title: "Preventive Care",
    text: "Professional cleaning, periodic checkups, and complete oral-health guidance.",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80",
    icon: ShieldCheck
  },
  {
    title: "Restorative Dentistry",
    text: "Fillings, crowns, and root-canal treatments with a comfort-first approach.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80",
    icon: SmilePlus
  },
  {
    title: "Cosmetic Smile Design",
    text: "Whitening, veneers, and smile design plans for natural premium aesthetics.",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1000&q=80",
    icon: Sparkles
  }
];

const stats = [
  { label: "Patient Satisfaction", value: "98%", icon: Star },
  { label: "Average Wait Time", value: "8 min", icon: Clock3 },
  { label: "Appointments / Month", value: "1.2k+", icon: CalendarCheck2 },
  { label: "Active Specialists", value: "24", icon: Users }
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    alt: "Modern Dental Equipment",
    className: "h-72"
  },
  {
    src: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    alt: "Patient Consultation",
    className: "h-48"
  },
  {
    src: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    alt: "Professional Staff",
    className: "h-48"
  },
  {
    src: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80",
    alt: "Clinical Excellence",
    className: "h-72"
  }
];

export default function LandingPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getClientSession());
    setLoading(false);
  }, []);

  const handleLogout = () => {
    clearClientSession();
    setSession(null);
  };

  const isDoctor = session?.role === "Doctor";
  const namePrefix = isDoctor ? "Dr. " : "";
  const firstName = session?.fullName?.split(" ")[0] || (isDoctor ? "Doctor" : "there");
  const dashboardHref = session ? homeForRole(session.role) : "/login";
  const appointmentsHref = isDoctor ? "/doctor/appointments" : "/patient/appointments";
  const showAppointments = session?.role === "Doctor" || session?.role === "Patient";

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <header className="container sticky top-0 z-50 flex items-center justify-between bg-background/80 py-4 backdrop-blur-md border-b">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Services</Link>
          <Link href="/dental-diseases" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dental Health</Link>
          <Link href="#gallery" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Gallery</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && session ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-2 text-primary hover:bg-primary/10">
                    <Stethoscope className="h-5 w-5" />
                    <span className="max-w-[120px] truncate font-semibold">
                      {namePrefix}{firstName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl">
                  <DropdownMenuLabel className="flex items-center gap-2 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{namePrefix}{session.fullName}</span>
                      <span className="text-xs text-muted-foreground">{session.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary">
                    <Link href={dashboardHref} className="flex w-full items-center gap-2 font-medium text-foreground">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {showAppointments && (
                    <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/5 focus:text-primary">
                      <Link href={appointmentsHref} className="flex w-full items-center gap-2 font-medium text-foreground">
                        Appointments
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full px-6 shadow-md transition-all hover:scale-105 active:scale-95">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 transition-colors duration-300">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl opacity-50" />
        
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Revolutionizing Dental Care Management
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-7xl">
              Elevate Your <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Dental Practice</span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
              A premium platform for modern dental clinics — patients book and track their care while clinic staff manage appointments, schedules, and records in one place.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-xl shadow-primary/20">
                <Link href="/register">Get Started Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-8 text-lg bg-background">
                <Link href="/dental-diseases">Dental Education</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1559839734-2b71f1e3c770?auto=format&fit=crop&w=150&h=150&q=80",
                  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&h=150&q=80",
                  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&h=150&q=80",
                  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80"
                ].map((url, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-muted">
                    <Image src={url} alt="doctor" width={40} height={40} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Trusted by <span className="text-foreground font-bold">500+</span> leading dentists
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.2 }} 
            className="relative"
          >
            <div className="relative z-10 overflow-hidden rounded-[2.5rem] border-[8px] border-background bg-background shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=80"
                alt="Professional dental clinic"
                width={1400}
                height={1000}
                className="h-[550px] w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-background/20 backdrop-blur-md p-6 border border-foreground/10 text-foreground">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary p-3">
                    <Stethoscope className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Smart Patient Care</h3>
                    <p className="text-sm text-muted-foreground">Manage records and appointments with ease.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 hidden rounded-2xl bg-card p-4 shadow-xl md:block border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient Efficiency</p>
                  <p className="font-bold text-foreground">+40%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-muted p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container py-24">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">Comprehensive Dental Solutions</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            From preventive care to advanced surgery, we provide the tools to manage every aspect of your clinical services.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div 
                key={service.title} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.15 }}
              >
                <Card className="group h-full overflow-hidden border border-border bg-card shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                  <Link href="/dental-diseases">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={service.image} 
                        alt={service.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-foreground">
                        <div className="rounded-lg bg-background/20 backdrop-blur-md p-2">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-lg">{service.title}</span>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.text}
                    </p>
                    <Button asChild variant="link" className="mt-4 p-0 text-primary font-bold">
                      <Link href="/dental-diseases">Explore Details →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Gallery/Dental Diseases Section */}
      <section className="bg-muted/30 py-24 transition-colors duration-300">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                Empower Your Patients with <br />
                <span className="text-primary">Dental Knowledge</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Better outcomes start with better understanding. Our integrated patient education module helps your patients learn about common dental conditions and treatments.
              </p>
              <ul className="space-y-4">
                {[
                  "Interactive disease guides",
                  "Prevention tips & best practices",
                  "Visual symptom checkers",
                  "Treatment pathway explainers"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/dental-diseases">Visit Health Portal</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="gallery">
              <div className="space-y-4">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`${img.className} group relative overflow-hidden rounded-3xl shadow-lg cursor-pointer`}
                  >
                    <Image 
                      src={img.src} 
                      alt={img.alt} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                        View Details
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4 pt-0 sm:pt-8">
                {galleryImages.slice(2, 4).map((img, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`${img.className} group relative overflow-hidden rounded-3xl shadow-lg cursor-pointer`}
                  >
                    <Image 
                      src={img.src} 
                      alt={img.alt} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                        View Details
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-[#23A0B3] px-8 py-20 text-center text-white lg:px-16 shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl text-white">Ready to Transform Your Clinic?</h2>
            <p className="mx-auto max-w-2xl text-xl text-slate-300/90 leading-relaxed">
              Join hundreds of successful dentists who have modernized their practice with Clinico. Start your free trial today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="h-14 rounded-full bg-white px-10 text-lg font-bold text-[#020617] hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl border-none">
                <Link href="/register">Create Your Account</Link>
              </Button>
              <Button asChild size="lg" className="h-14 rounded-full border-2 border-white/30 bg-transparent px-10 text-lg font-bold text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-16 transition-colors duration-300">
        <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
          <Logo />
          <nav className="flex gap-8">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Contact Us</Link>
          </nav>
          <p className="text-sm text-muted-foreground">© 2026 Clinico Dental Care. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
