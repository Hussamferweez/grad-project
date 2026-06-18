"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Info, AlertTriangle, CheckCircle2, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const diseases = [
  {
    id: "cavities",
    title: "Dental Cavities (Tooth Decay)",
    description: "Cavities are permanently damaged areas in the hard surface of your teeth that develop into tiny openings or holes.",
    longDescription: "Cavities, also called tooth decay or caries, are caused by a combination of factors, including bacteria in your mouth, frequent snacking, sipping sugary drinks, and not cleaning your teeth well. If cavities aren't treated, they get larger and affect deeper layers of your teeth. They can lead to severe toothache, infection and tooth loss.",
    symptoms: ["Toothache", "Tooth sensitivity", "Pain when eating sweet, hot or cold", "Visible holes in teeth"],
    prevention: ["Brush with fluoride toothpaste", "Visit your dentist regularly", "Avoid frequent snacking", "Eat tooth-healthy foods"],
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gum-disease",
    title: "Gingivitis & Periodontitis",
    description: "Gum disease is an inflammation of the gum line that can progress to affect the bone that surrounds and supports your teeth.",
    longDescription: "Gingivitis is the earliest stage of gum disease, an inflammation of the tissues, caused by plaque buildup at the gumline. If daily brushing and flossing do not remove the plaque, it produces toxins (poisons) that can irritate the gum tissue, causing gingivitis. At this early stage in gum disease, damage can be reversed, since the bone and connective tissue that hold the teeth in place are not yet affected.",
    symptoms: ["Swollen or puffy gums", "Gums that bleed easily", "Bad breath", "Receding gums"],
    prevention: ["Brush twice a day", "Floss daily", "Regular dental cleanings", "Avoid tobacco"],
    icon: Activity,
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sensitivity",
    title: "Tooth Sensitivity",
    description: "Tooth sensitivity is pain or discomfort in the teeth as a response to certain stimuli, such as hot or cold temperatures.",
    longDescription: "Tooth sensitivity, or 'dentin hypersensitivity,' is exactly what it sounds like: pain or discomfort in the teeth as a response to certain stimuli, such as hot or cold temperatures. It may be a temporary or a chronic problem, and it can affect one tooth, several teeth, or all the teeth in a single person. It can have a number of causes, but most cases of sensitive teeth are easily treated with a change in your oral hygiene regimen.",
    symptoms: ["Pain with hot/cold items", "Pain when brushing", "Sharp pain from cold air", "Sensitivity at gum line"],
    prevention: ["Use desensitizing toothpaste", "Use a soft toothbrush", "Avoid acidic foods", "Use fluoride mouthwash"],
    icon: HeartPulse,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "oral-cancer",
    title: "Oral Cancer",
    description: "Oral cancer includes cancers of the lips, tongue, cheeks, floor of the mouth, hard and soft palate, and pharynx.",
    longDescription: "Oral cancer appears as a growth or sore in the mouth that does not go away. Oral cancer, which includes cancers of the lips, tongue, cheeks, floor of the mouth, hard and soft palate, sinuses, and pharynx (throat), can be life-threatening if not diagnosed and treated early. Regular dental checkups are key to early detection.",
    symptoms: ["Sores that don't heal", "White or red patches", "Unexplained bleeding", "Numbness in face/neck"],
    prevention: ["Avoid tobacco products", "Moderate alcohol use", "Healthy diet", "Regular dental checkups"],
    icon: Info,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
  }
];

export default function DentalDiseasesPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Common Dental Diseases
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding oral health issues is the first step toward a lifetime of healthy smiles. 
            Learn about common conditions, their symptoms, and how to prevent them.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {diseases.map((disease, index) => (
            <motion.div
              key={disease.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                    src={disease.image} 
                    alt={disease.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute top-4 left-4 rounded-2xl p-3 ${disease.bgColor} backdrop-blur-md bg-opacity-90 shadow-lg border border-white/20`}>
                    <disease.icon className={`h-6 w-6 ${disease.color}`} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">
                          View Detailed Guide
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
                        <DialogHeader>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`rounded-2xl p-4 ${disease.bgColor}`}>
                              <disease.icon className={`h-8 w-8 ${disease.color}`} />
                            </div>
                            <div>
                              <DialogTitle className="text-3xl font-bold">{disease.title}</DialogTitle>
                              <DialogDescription className="text-lg mt-1">{disease.description}</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                        
                        <div className="grid gap-8 mt-6">
                          <div className="relative h-64 w-full rounded-2xl overflow-hidden">
                            <img src={disease.image} alt={disease.title} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                              <Info className="h-6 w-6 text-primary" />
                              Overview
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                              {disease.longDescription}
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-6 rounded-2xl bg-muted/50 border border-border">
                              <h3 className="text-xl font-bold flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Key Symptoms
                              </h3>
                              <ul className="space-y-3">
                                {disease.symptoms.map((symptom, i) => (
                                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                                    {symptom}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                                Prevention Steps
                              </h3>
                              <ul className="space-y-3">
                                {disease.prevention.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className={`h-1.5 w-full ${disease.color.replace('text', 'bg')}`} />
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
                  <CardTitle className="text-2xl font-bold">{disease.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-grow p-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {disease.description}
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        Symptoms
                      </h4>
                      <ul className="space-y-2">
                        {disease.symptoms.map((symptom) => (
                          <li key={symptom} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-border" />
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Prevention
                      </h4>
                      <ul className="space-y-2">
                        {disease.prevention.map((item) => (
                          <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/30" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 rounded-3xl bg-primary/5 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground">Need a Professional Consultation?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Early detection is key to treating dental issues effectively. 
            Schedule an appointment with our specialists today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Book an Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-background">
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-border bg-background py-12 transition-colors duration-300">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Clinico Dental Care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
