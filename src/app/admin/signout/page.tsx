import { signOut, auth } from "@/auth";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign Out | Vestry Admin",
};

export default async function SignOutPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Architectural background lines */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-px h-full bg-foreground/4" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white/4" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/4" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/4" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/4" />
        {/* Red focal glow for signout context */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-card/40 backdrop-blur-3xl border border-border rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden group">
        {/* Top red rule */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner shadow-red-500/20 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
            <LogOut size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
            Sign out of Vestry
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Are you sure you want to securely end your session as <span className="font-bold text-foreground break-all">{session.user?.email}</span>?
          </p>

          <div className="w-full space-y-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className={cn(
                  "w-full relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-2xl border transition-all active:scale-95 disabled:opacity-50 py-4 px-6 text-xs bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20 border-transparent cursor-pointer"
                )}
              >
                Yes, Sign Me Out
              </button>
            </form>

            <Link
              href="/admin"
              className={cn(
                "w-full relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-2xl border transition-all active:scale-95 disabled:opacity-50 py-4 px-6 text-xs bg-card border-border hover:bg-muted text-foreground hover:border-amber-500/50 hover:text-amber-500 cursor-pointer"
              )}
            >
              <ArrowLeft size={16} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
