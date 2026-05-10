/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ChevronRight,
  CreditCard
} from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { Button } from "@/components/ui/Button";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-amber-500/30 selection:text-amber-500">
      <LandingNavbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251,191,36,0.3) 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/5 border border-amber-500/10 backdrop-blur-md mb-8"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">The Future of Events is Here</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8"
            >
              Vestry. <br />
              <span className="text-amber-500">Discover</span> Your <br />
              Next Adventure.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              A premium ticketing platform built for elite experiences. Discover exclusive events, manage bookings, and attend with style.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/events">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="rounded-full px-12 py-7 text-xs uppercase tracking-[0.2em] font-black"
                  rightIcon={<ArrowRight size={16} />}
                >
                  Browse Events
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-12 py-7 text-xs uppercase tracking-[0.2em] font-black"
                >
                  Create Your Own
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 border-y border-border bg-card/30"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <StatItem label="Active Users" value="10M+" />
              <StatItem label="Global Events" value="500K+" />
              <StatItem label="Revenue Processed" value="$2B+" />
              <StatItem label="Success Rate" value="99.9%" />
            </div>
          </div>
        </motion.section>

        {/* --- FEATURES BENTO GRID --- */}
        <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-4">Core Infrastructure</h2>
            <p className="text-4xl md:text-5xl font-black">Built for Scale.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <BentoCard 
              className="md:col-span-2"
              icon={ShieldCheck}
              title="Enterprise Security"
              description="Banking-grade encryption, 2FA, and audit logging for every action. Your event data is fortified against any threat."
            />
            <BentoCard 
              icon={Zap}
              title="Instant Checkout"
              description="Proprietary checkout engine optimized for mobile devices and high-concurrency ticket drops."
            />
            <BentoCard 
              icon={Globe}
              title="Global Reach"
              description="Multi-currency support and localized payment gateways including Paystack for African markets."
            />
            <BentoCard 
              className="md:col-span-2"
              icon={CreditCard}
              title="Automated Settlements"
              description="No more waiting for payouts. Our automated ledger system settles event revenue directly to your bank account."
            />
          </motion.div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-32">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="bg-amber-500 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-amber-600 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-amber-950 mb-8 leading-tight">
                  Ready to host your <br /> next masterpiece?
                </h2>
                <Link href="/admin/signup">
                  <button className="bg-amber-950 text-amber-500 px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all shadow-2xl">
                    Get Started Free
                  </button>
                </Link>
                <p className="mt-8 text-amber-900/60 text-xs font-bold uppercase tracking-widest">
                  No credit card required. Setup in 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-5xl font-black text-foreground mb-2">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

function BentoCard({ icon: Icon, title, description, className = "" }: { icon: any; title: string; description: string; className?: string }) {
  return (
    <div className={`p-10 rounded-[2.5rem] border border-border bg-card/30 hover:bg-card/50 transition-all group ${className}`}>
      <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-black mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Learn More <ChevronRight size={12} />
      </div>
    </div>
  );
}
