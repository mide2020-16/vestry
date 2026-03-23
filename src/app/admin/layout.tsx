import { auth } from '@/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen overflow-hidden bg-neutral-950 flex flex-row">
      <AdminSidebar email={session?.user?.email ?? null} />

      <main className="h-full flex-1 overflow-y-auto p-5 pb-20 md:p-10 md:pb-10">
        <div className="max-w-6xl mx-auto my-4 px-4">
          {children}
        </div>
      </main>
    </div>
  );
}