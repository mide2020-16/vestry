import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    // h-screen + overflow-hidden prevents the whole page from scrolling
    <div className="h-screen w-full bg-neutral-950 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Fixed width on desktop */}
      <AdminSidebar email={session?.user?.email ?? null} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Optional: Mobile Header (since sidebar is usually hidden on small screens) */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
          <span className="text-white font-bold tracking-widest uppercase text-sm">
            Vestry Admin
          </span>
          {/* You can add a mobile menu trigger here if your Sidebar component doesn't have one */}
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-4 py-8 md:px-10 md:py-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
