/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { MobileNav } from "@/components/admin/MobileNav";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const user = session.user as any;

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden transition-colors">
      <AdminSidebar email={user.email} role={user.role} />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Shared Topbar */}
        <AdminTopbar />

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0 scroll-smooth">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-10 lg:px-16 xl:px-24 py-8 md:py-12">
            {children}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
