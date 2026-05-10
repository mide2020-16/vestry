"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ShieldCheck className="text-amber-500 group-hover:rotate-12 transition-transform" size={24} />
          <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground">Vestry</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              href={link.href}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-amber-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/admin/login">
            <Button variant="secondary" className="rounded-full px-6 py-2" rightIcon={<ArrowRight size={14} />}>
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-black uppercase tracking-[0.2em] text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full">Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
