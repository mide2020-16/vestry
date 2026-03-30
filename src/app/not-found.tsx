"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  Search,
} from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();
  const isContext = (path: string) => pathname?.includes(path);

  const getDynamicContent = () => {
    if (isContext("/admin")) {
      return {
        title: "Admin Restricted Area",
        message:
          "The management page you're looking for doesn't exist or you lack permissions.",
        icon: <ShieldAlert className="w-12 h-12 text-red-500" />,
        link: "/admin",
        label: "Back to Dashboard",
      };
    }

    if (isContext("/register")) {
      return {
        title: "Items Not Found",
        message: "We couldn't find that specific product or registration tier.",
        icon: <ShoppingBag className="w-12 h-12 text-amber-500" />,
        link: "/register",
        label: "View All Products",
      };
    }

    // Default 404 Content
    return {
      title: "Lost in the Vestry?",
      message: "The page you're looking for has been moved or deleted.",
      icon: <Search className="w-12 h-12 text-neutral-500" />,
      link: "/",
      label: "Return Home",
    };
  };

  const content = getDynamicContent();

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon */}
        <div className="mb-6 flex justify-center animate-pulse">
          {content.icon}
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-black text-white/5 mb-4 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -z-10 select-none">
          404
        </h1>

        <h2 className="text-3xl font-bold text-white mb-3">{content.title}</h2>

        <p className="text-neutral-400 mb-8 leading-relaxed">
          {content.message}
          <br />
          <span className="text-xs font-mono text-neutral-600 mt-2 block">
            Path: {pathname}
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-all font-medium"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link
            href={content.link}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-black rounded-xl hover:bg-amber-300 transition-all font-bold"
          >
            <Home size={18} />
            {content.label}
          </Link>
        </div>

        {/* Footer Suggestion */}
        <p className="mt-12 text-sm text-neutral-500">
          Think this is a mistake?{" "}
          <Link href="/contact" className="text-amber-400/50 underline">
            Report it
          </Link>
        </p>
      </div>
    </div>
  );
}
