import type { Metadata, Viewport } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vestry | MFMCF FUNAAB',
  description: 'Register for the Vestry Event',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vestry',
  },
  icons: {
    icon: '/logo/logo.png',
    apple: '/logo/apple-touch-icon.png', // should be 180×180
  },
  openGraph: {
    title: 'Vestry 2026/2027',
    description: 'Secure your ticket, select your merch allocation, and customize your dining experience.',
    siteName: 'Vestry Event',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // should be a 1200×630 social preview image
        width: 1200,
        height: 630,
        alt: 'Vestry 2026/2027 — Official Registration Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vestry 2026/2027',
    description: 'Secure your ticket, select your merch allocation, and customize your dining experience.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}