"use client";

import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { Sparkles, ShieldCheck, Zap, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            The Philosophy of <br />
            <span className="text-amber-500">Precision Whimsy.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Vestry was founded on a simple yet ambitious premise: that event technology should be as inspiring as the events it powers. We bridge the gap between technical excellence and aesthetic delight.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          <FeatureCard 
            icon={ShieldCheck}
            title="Fortified Security"
            description="Our platform is built on enterprise-grade security protocols, ensuring that your data and registrations are protected by industry-leading encryption and 2FA standards."
          />
          <FeatureCard 
            icon={Zap}
            title="Blazing Performance"
            description="Engineered for speed, Vestry handles millions of concurrent registrations without breaking a sweat. We utilize edge-computing and optimized database schemas for near-zero latency."
          />
          <FeatureCard 
            icon={Sparkles}
            title="Aesthetic First"
            description="We believe in the power of design. Every interaction in Vestry is polished with micro-animations and a sleek dark-mode aesthetic that reflects the premium nature of your events."
          />
          <FeatureCard 
            icon={Heart}
            title="Human Centric"
            description="Technology should empower people, not frustrate them. Our intuitive dashboards and streamlined checkout flows make event management accessible to everyone."
          />
        </div>

        <section className="bg-card/50 border border-border rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
           <h2 className="text-3xl md:text-5xl font-black mb-8 relative z-10">Ready to transform your events?</h2>
           <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto relative z-10">
             Join thousands of event organizers who trust Vestry to deliver world-class experiences.
           </p>
           <a 
             href="/admin/signup" 
             className="inline-flex px-10 py-5 bg-amber-500 text-amber-950 font-black uppercase tracking-[0.2em] text-xs rounded-full hover:scale-105 transition-all relative z-10"
           >
             Start Your Journey
           </a>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl border border-border bg-card/30 hover:bg-card/50 transition-colors">
      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
