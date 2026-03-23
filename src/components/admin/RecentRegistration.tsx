interface Registration {
  _id: { toString(): string };
  name: string;
  ticketType: string;
  totalAmount: number;
  paymentStatus: boolean;
}

interface RecentRegistrationsProps {
  registrations: Registration[];
}

function PaymentBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        paid
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
      }`}
    >
      {paid ? 'Paid' : 'Pending'}
    </span>
  );
}

export function RecentRegistrations({ registrations }: RecentRegistrationsProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Recent Registrations</h3>

      {registrations.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center bg-black/20 rounded-xl border border-neutral-800">
          No registrations yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950/50 text-neutral-500">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Name</th>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 5).map((reg) => (
                <tr
                  key={reg._id.toString()}
                  className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">{reg.name}</td>
                  <td className="px-6 py-4 capitalize">{reg.ticketType}</td>
                  <td className="px-6 py-4 font-mono">₦{reg.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <PaymentBadge paid={reg.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}