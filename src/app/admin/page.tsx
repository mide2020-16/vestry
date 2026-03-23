import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import { StatCard, SplitStat } from '../../components/admin/StatCard';
import { RecentRegistrations } from '../../components/admin/RecentRegistration';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await dbConnect();

  const registrations = await Registration.find().lean();

  const paid = registrations.filter((r) => r.paymentStatus);

  const totalRevenue = paid.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalAttendees = registrations.reduce(
    (sum, r) => sum + (r.ticketType === 'couple' ? 2 : 1),
    0,
  );
  const singleTickets = registrations.filter((r) => r.ticketType === 'single').length;
  const coupleTickets = registrations.filter((r) => r.ticketType === 'couple').length;
  const successfulPayments = paid.length;
  const pendingPayments = registrations.length - paid.length;

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Revenue" accentColor="bg-amber-500/10">
          <p className="text-3xl font-black text-white">₦{totalRevenue.toLocaleString()}</p>
        </StatCard>

        <StatCard label="Total Attendees" accentColor="bg-emerald-500/10">
          <p className="text-3xl font-black text-white">{totalAttendees}</p>
        </StatCard>

        <StatCard label="Ticket Types" accentColor="bg-blue-500/10">
          <SplitStat
            left={{ value: singleTickets, label: 'Singles' }}
            right={{ value: coupleTickets, label: 'Couples' }}
          />
        </StatCard>

        <StatCard label="Payment Status" accentColor="bg-purple-500/10">
          <SplitStat
            left={{ value: successfulPayments, label: 'Paid', className: 'text-emerald-400' }}
            right={{ value: pendingPayments, label: 'Pending', className: 'text-neutral-300' }}
          />
        </StatCard>
      </div>

      <RecentRegistrations registrations={registrations} />
    </div>
  );
}
