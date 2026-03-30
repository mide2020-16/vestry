import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import { StatCard, SplitStat } from '@/components/admin/StatCard';
import { RecentRegistrations } from '@/components/admin/RecentRegistration';
import DownloadButton, { type RegistrationForPDF } from '@/components/admin/DownloadButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await dbConnect();

  const registrations = await Registration.find()
    .populate('meshSelection', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // paymentStatus can be boolean true OR the string 'success' depending on
  // when the record was created — handle both
  const isPaid = (r: (typeof registrations)[number]) =>
    r.paymentStatus === true || (r.paymentStatus as unknown) === 'success';

  const paidRegistrations = registrations.filter(isPaid);

  const totalRevenue = paidRegistrations.reduce(
    (sum: number, r) => sum + (r.totalAmount || 0),
    0,
  );

  const totalAttendees = registrations.reduce(
    (sum: number, r) => sum + (r.ticketType === 'couple' ? 2 : 1),
    0,
  );

  const singleTickets = registrations.filter((r) => r.ticketType === 'single').length;
  const coupleTickets = registrations.filter((r) => r.ticketType === 'couple').length;

  const successfulPayments = paidRegistrations.length;
  const pendingPayments = registrations.length - successfulPayments;

  // Shape the paid registrations into the type DownloadButton expects
  const registrationsForPDF: RegistrationForPDF[] = paidRegistrations.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    email: r.email,
    ticketType: r.ticketType,
    meshSelection: r.meshSelection
      ? { name: (r.meshSelection as unknown as { name: string }).name }
      : undefined,
    meshSize: r.meshSize ?? undefined,
    meshColor: r.meshColor ?? undefined,
    meshInscriptions: r.meshInscriptions ?? undefined,
    totalAmount: r.totalAmount,
  }));

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Dashboard <span className="text-amber-500">Overview</span>
          </h2>
          <p className="text-neutral-500 mt-2 text-sm md:text-base">
            Real-time analytics for your event registrations.
          </p>
        </div>

        <DownloadButton registrations={registrationsForPDF} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Revenue" accentColor="bg-amber-500/5 border-amber-500/10">
          <p className="text-2xl md:text-3xl font-black text-amber-500">
            ₦{totalRevenue.toLocaleString()}
          </p>
        </StatCard>

        <StatCard label="Total Attendees" accentColor="bg-emerald-500/5 border-emerald-500/10">
          <p className="text-2xl md:text-3xl font-black text-emerald-400">
            {totalAttendees}
          </p>
        </StatCard>

        <StatCard label="Ticket Types" accentColor="bg-blue-500/5 border-blue-500/10">
          <SplitStat
            left={{ value: singleTickets, label: 'Singles' }}
            right={{ value: coupleTickets, label: 'Couples' }}
          />
        </StatCard>

        <StatCard label="Payment Status" accentColor="bg-purple-500/5 border-purple-500/10">
          <SplitStat
            left={{ value: successfulPayments, label: 'Paid', className: 'text-emerald-400' }}
            right={{ value: pendingPayments, label: 'Pending', className: 'text-neutral-400' }}
          />
        </StatCard>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-1 md:p-6">
        <RecentRegistrations registrations={registrations} />
      </div>
    </div>
  );
}