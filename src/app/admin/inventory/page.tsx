import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Registration from '@/models/Registration';
import { Types } from 'mongoose';

export const dynamic = 'force-dynamic';

// ── types ──────────────────────────────────────────────────────────────────

interface ProductStat {
  name: string;
  category: string;
  count: number;
  revenue: number;
}

// ── helpers ────────────────────────────────────────────────────────────────

function toId(value: unknown): string {
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  return String(value);
}

// ── components ─────────────────────────────────────────────────────────────

function InventoryTable({
  title,
  icon,
  accentColor,
  glowColor,
  rows,
  columns,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  rows: ProductStat[];
  columns: { label: string; render: (s: ProductStat) => React.ReactNode; align?: string }[];
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-[50px] pointer-events-none`} />
      <h3 className={`text-xl font-bold ${accentColor} mb-6 flex items-center gap-2`}>
        {icon}
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="text-xs uppercase bg-black/40 text-neutral-500">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 ${col.align ?? ''} ${i === 0 ? 'rounded-tl-lg' : ''} ${i === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-neutral-600">
                  No data yet
                </td>
              </tr>
            ) : (
              rows.map((stat) => (
                <tr key={stat.name} className="hover:bg-neutral-800/20 transition-colors">
                  {columns.map((col) => (
                    <td key={col.label} className={`px-4 py-3 ${col.align ?? ''}`}>
                      {col.render(stat)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function AdminInventoryPage() {
  await dbConnect();

  const [products, registrations] = await Promise.all([
    Product.find().lean(),
    Registration.find({ paymentStatus: true }).lean(),
  ]);

  // Seed stat map from products
  const statMap = new Map<string, ProductStat>(
    products.map((p) => [
      p._id.toString(),
      { name: p.name, category: p.category, count: 0, revenue: 0 },
    ]),
  );

  // Accumulate counts from paid registrations
  for (const reg of registrations) {
    // mesh — couples receive 2
    if (reg.meshSelection) {
      const id = toId(reg.meshSelection);
      const stat = statMap.get(id);
      if (stat) {
        const qty = reg.ticketType === 'couple' ? 2 : 1;
        const prod = products.find((p) => p._id.toString() === id);
        stat.count += qty;
        stat.revenue += (prod?.price ?? 0) * qty;
      }
    }

    // Food selections
    for (const foodId of (reg.foodSelections ?? [])) {
      const stat = statMap.get(toId(foodId));
      if (stat) stat.count += 1;
    }

    // Drink selection
    if (reg.drinkSelection) {
      const stat = statMap.get(toId(reg.drinkSelection));
      if (stat) stat.count += 1;
    }
  }

  const byCount = (a: ProductStat, b: ProductStat) => b.count - a.count;
  const all = [...statMap.values()];

  const meshStats = all.filter((p) => p.category === 'mesh').sort(byCount);
  const foodStats = all.filter((p) => p.category === 'food' || p.category === 'drink').sort(byCount);

  const meshIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const foodIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Inventory & Orders</h2>
      <p className="text-neutral-400 mb-8 border-b border-neutral-800 pb-4">
        Real-time counts of items ordered by paid attendees.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <InventoryTable
          title="mesh Allocations"
          icon={meshIcon}
          accentColor="text-amber-500"
          glowColor="bg-amber-500/5"
          rows={meshStats}
          columns={[
            { label: 'mesh Type',     render: (s) => <span className="font-medium text-white">{s.name}</span> },
            { label: 'Qty Ordered',   render: (s) => <span className="font-black text-amber-400">{s.count}</span>,         align: 'text-right' },
            { label: 'Est. Revenue',  render: (s) => <span className="font-mono">₦{s.revenue.toLocaleString()}</span>,     align: 'text-right' },
          ]}
        />

        <InventoryTable
          title="Food & Beverage Counts"
          icon={foodIcon}
          accentColor="text-emerald-500"
          glowColor="bg-emerald-500/5"
          rows={foodStats}
          columns={[
            { label: 'Item Name',      render: (s) => <span className="font-medium text-white">{s.name}</span> },
            { label: 'Category',       render: (s) => <span className="uppercase text-xs tracking-wider text-neutral-500">{s.category}</span> },
            { label: 'Total Portions', render: (s) => <span className="font-black text-emerald-400">{s.count}</span>,  align: 'text-right' },
          ]}
        />
      </div>
    </div>
  );
}