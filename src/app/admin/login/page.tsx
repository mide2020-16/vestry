import { signIn } from "@/auth";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Architectural background lines */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden
      >
        <div className="absolute top-0 left-1/4 w-px h-full bg-foreground/4" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white/4" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/4" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/4" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/4" />
        {/* Amber focal glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-500/4 rounded-full blur-[120px]" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Top amber rule */}
        <div className="h-px bg-linear-to-r from-transparent via-amber-400 to-transparent mb-12" />

        {/* Brand */}
        <div className="mb-12">
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            Admin Portal
          </p>
          <h1
            className="text-foreground font-black uppercase leading-none tracking-[0.15em] rounded-xl"
            style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}
          >
            Vestry
          </h1>
          <p className="text-muted-foreground/50 text-sm mt-3 leading-relaxed">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">
            Authenticate
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Sign in form */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="group w-full relative overflow-hidden border border-border hover:border-amber-400/50 bg-card hover:bg-accent text-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            {/* Hover glow sweep */}
            <span className="absolute inset-0 bg-linear-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {/* Google icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777l-4.04 3.095C3.196 21.298 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
              />
              <path
                fill="#4A90D9"
                d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
              />
              <path
                fill="#FBBC05"
                d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
              />
            </svg>

            <span className="relative">Continue with Google</span>
          </button>
        </form>

        {/* Bottom rule + footnote */}
        <div className="mt-10">
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent mb-6" />
          <p className="text-muted-foreground/40 text-xs text-center tracking-wide">
            Only pre-authorized accounts may proceed.
          </p>
        </div>
      </div>
    </div>
  );
}
