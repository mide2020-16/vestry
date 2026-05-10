/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Twitter, Instagram, Github, Mail, ShieldCheck } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Events", href: "/events" },
        { label: "Community", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-card/50 border-t border-border mt-20 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-amber-500" size={24} />
              <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground">Vestry</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Experience the next generation of event discovery and registration. Built for high-performance and elite experiences.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Instagram} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Mail} href="mailto:hello@vestry.com" />
            </div>
          </div>

          {sections.map((section) => (section.title && (
            <div key={section.title}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-500 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )))}
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            © {currentYear} Vestry System — Precision Whimsy Engine
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <Link 
      href={href}
      className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 transition-all active:scale-90"
    >
      <Icon size={18} />
    </Link>
  );
}
