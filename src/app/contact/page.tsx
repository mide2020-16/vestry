/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              Let&apos;s Start a <br />
              <span className="text-amber-500">Conversation.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Whether you&apos;re planning a high-stakes corporate summit or an exclusive community gathering, we&apos;re here to help you scale.
            </p>

            <div className="space-y-8">
              <ContactInfo 
                icon={Mail}
                label="Email Us"
                value="hello@vestry.com"
              />
              <ContactInfo 
                icon={MessageSquare}
                label="Live Chat"
                value="Available 24/7 in your dashboard"
              />
              <ContactInfo 
                icon={MapPin}
                label="HQ"
                value="Lagos, Nigeria — Distributed Team"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/40 border border-border rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
            
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <SimpleInput placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <SimpleInput type="email" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                <SimpleInput placeholder="Event Management Inquiry" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                <textarea 
                  className="w-full bg-card border border-border focus:border-amber-500/50 rounded-2xl p-4 min-h-[150px] transition-all focus:outline-none text-foreground"
                  placeholder="How can we help you?"
                />
              </div>

              <Button variant="primary" className="w-full py-4" rightIcon={<Send size={18} />}>
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
