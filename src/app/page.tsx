import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import { InstallPrompt } from '@/components/InstallPrompt';

export const metadata: Metadata = {
  title: 'Vestry Event',
  description: 'Register for the Vestry Event',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vestry',
  },
  icons: {
    icon: '/logo/logo.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Vestry 2026/2027',
    description: 'Secure your ticket, select your mesh allocation, and customize your dining experience.',
    siteName: 'Vestry Event',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vestry 2026/2027 — Official Registration Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vestry 2026/2027',
    description: 'Secure your ticket, select your mesh allocation, and customize your dining experience.',
    images: ['/og-image.png'],
  },
};

// Correct Next.js 14+ way to export viewport/themeColor
export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Layered ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 w-75 h-75 bg-amber-400/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-62 h-62 bg-orange-600/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-amber-500/20 rounded-tl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-amber-500/20 rounded-br-lg" />
      </div>

      <div className="text-center space-y-6 max-w-2xl relative z-10 animate-fade-in">

        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Registration Now Open
        </div>

        {/* Main heading */}
        <h1
          className="text-6xl md:text-8xl font-black text-transparent leading-none tracking-tighter"
          style={{
            backgroundImage: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 40%, #d97706 80%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Vestry
          <br />
          <span className="text-5xl md:text-6xl font-bold opacity-80">2026 / 2027</span>
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-4 justify-center py-2">
          <div className="h-px w-12 bg-linear-to-r from-transparent to-amber-500/50" />
          <span className="text-amber-500/60 text-xs tracking-widest uppercase">Official Portal</span>
          <div className="h-px w-12 bg-linear-to-l from-transparent to-amber-500/50" />
        </div>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-md mx-auto">
          Secure your ticket 🎟️, select your mesh allocation 🗺️, and customize your dining experience 🍽️ — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="vestry-primary-btn group relative px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl text-lg transition-all duration-200 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <span className="relative flex items-center gap-2">✨ Start Registration</span>
          </Link>

          <Link
            href="/admin"
            className="px-8 py-4 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/60 hover:border-amber-500/30 hover:bg-neutral-800/80 text-neutral-300 hover:text-white font-medium rounded-2xl text-lg transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
          >
            🔐 Admin Portal
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-neutral-600 text-xs pt-6 tracking-wide">
          Need help? Reach out to your cell leader or parish coordinator.
        </p>
      </div>

      <PushNotificationManager />
      <InstallPrompt />
    </div>
  );
}