/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/models/User";
import EventSwitcher from "@/components/admin/EventSwitcher";

export const dynamic = "force-dynamic";

interface ProductStat {
  name: string;
  category: string;
  count: number;
  revenue: number;
  colorSizes?: {
    color: string;
    size: string;
    qty: number;
    hex?: string;
    inscriptions: string[];
  }[];
}

function toId(value: unknown): string {
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === "string") return value;
  return String(value);
}

function getColorLabel(
  hex: string,
  colors: { label: string; value: string }[],
): string {
  const found = colors.find(
    (c) => c.value.toLowerCase() === (hex || "").toLowerCase(),
  );
  return found ? found.label : hex || "Unknown";
}

function InventoryTable({ title, icon, accentColor, glowColor, rows, columns }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden transition-colors">
      <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-[50px] pointer-events-none`} />
      <h3 className={`text-xl font-bold ${accentColor} mb-6 flex items-center gap-2`}>{icon}{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
            <tr>{columns.map((col: any) => <th key={col.label} className={`px-4 py-3 ${col.align ?? ""}`}>{col.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-8 text-neutral-600 italic text-xs">No orders found</td></tr>
            ) : (
              rows.map((stat: any) => (
                <tr key={stat.name} className="hover:bg-neutral-800/20 transition-colors group">
                  {columns.map((col: any) => <td key={col.label} className={`px-4 py-3 align-top ${col.align ?? ""}`}>{col.render(stat)}</td>)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { eventId } = await searchParams;
  await dbConnect();
  
  // Fetch fresh user from DB to avoid stale session data
  const User = (await import("@/models/User")).default;
  const dbUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;

  if (!dbUser) redirect("/admin/login");

  const query: any = {};
  if (dbUser.role !== UserRole.SUPER_ADMIN) {
    const managedEventIds = dbUser.managedEvents?.map((id: any) => id.toString()) || [];
    if (eventId) {
      if (!managedEventIds.includes(eventId)) redirect("/unauthorized");
      query.eventId = eventId;
    } else if (managedEventIds.length > 0) {
      query.eventId = managedEventIds[0];
    } else {
      return <div className="py-20 text-center">No Events Assigned</div>;
    }
  } else if (eventId) {
    query.eventId = eventId;
  }

  const [products, registrations, eventDoc] = await Promise.all([
    Product.find(query).lean(),
    Registration.find({ ...query, paymentStatus: true }).lean(),
    Event.findById(query.eventId || eventId).lean(),
  ]);

  const meshColors = eventDoc?.config?.meshColors ?? [];

  const statMap = new Map<string, ProductStat>(
    products.map((p) => [
      p._id.toString(),
      { name: p.name, category: p.category, count: 0, revenue: 0, colorSizes: [] },
    ]),
  );

  for (const reg of registrations) {
    if (reg.merch && reg.merch.length > 0) {
      for (const item of reg.merch) {
        const id = toId(item.productId);
        const stat = statMap.get(id);
        if (stat) {
          const qty = item.quantity || 1;
          const prod = products.find((p) => p._id.toString() === id);
          stat.count += qty;
          stat.revenue += (prod?.price ?? 0) * qty;
          const colorName = getColorLabel(item.color ?? "", meshColors);
          const sizeName = item.size ?? "Standard";
          const existing = stat.colorSizes!.find((cs) => cs.color === colorName && cs.size === sizeName);
          if (existing) {
            existing.qty += qty;
            if (item.inscriptions) existing.inscriptions.push(item.inscriptions);
          } else {
            stat.colorSizes!.push({ color: colorName, size: sizeName, qty, hex: item.color, inscriptions: item.inscriptions ? [item.inscriptions] : [] });
          }
        }
      }
    }
    for (const foodId of reg.foodSelections ?? []) {
      const stat = statMap.get(toId(foodId));
      if (stat) stat.count += 1;
    }
    for (const drinkId of (Array.isArray(reg.drinkSelection) ? reg.drinkSelection : (reg.drinkSelection ? [reg.drinkSelection] : []))) {
      const stat = statMap.get(toId(drinkId));
      if (stat) stat.count += 1;
    }
  }

  const all = [...statMap.values()];
  const meshStats = all.filter((p) => p.category === "mesh").sort((a, b) => b.count - a.count);
  const foodStats = all.filter((p) => p.category === "food" || p.category === "drink").sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Inventory & <span className="text-amber-500">Orders</span></h2>
          <p className="text-neutral-500 mt-2 text-sm">Scoped to: {eventDoc?.name || "Global"}</p>
        </div>
        <EventSwitcher />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <InventoryTable
          title="Merch Allocations"
          accentColor="text-amber-500"
          glowColor="bg-amber-500/5"
          rows={meshStats}
          columns={[
            { label: "Item", render: (s: any) => <span className="font-bold text-white block">{s.name}</span> },
            {
              label: "Variants", render: (s: any) => (
                <div className="flex flex-col gap-2">
                  {s.colorSizes.map((cs: any) => (
                    <div key={`${cs.color}-${cs.size}`} className="flex items-center gap-2 text-[10px]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cs.hex }} />
                      <span>{cs.color} | {cs.size}</span>
                      <span className="text-amber-500 font-bold ml-auto">×{cs.qty}</span>
                    </div>
                  ))}
                </div>
              )
            },
            { label: "Total", render: (s: any) => <span className="font-black text-white">{s.count}</span>, align: "text-right" },
            { label: "Revenue", render: (s: any) => <span className="text-xs">₦{s.revenue.toLocaleString()}</span>, align: "text-right" },
          ]}
        />
        <InventoryTable
          title="Food & Drinks"
          accentColor="text-emerald-500"
          glowColor="bg-emerald-500/5"
          rows={foodStats}
          columns={[
            { label: "Item", render: (s: any) => <span className="font-bold text-white">{s.name}</span> },
            { label: "Category", render: (s: any) => <span className="uppercase text-[10px] font-black text-neutral-600">{s.category}</span> },
            { label: "Count", render: (s: any) => <span className="font-black text-emerald-400 text-lg">{s.count}</span>, align: "text-right" },
          ]}
        />
      </div>
    </div>
  );
}
