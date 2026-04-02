import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Registration from "@/models/Registration";
import { Types } from "mongoose";
import Settings from "@/models/Settings";
export const dynamic = "force-dynamic";

// ── types ──────────────────────────────────────────────────────────────────
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

// ── helpers ────────────────────────────────────────────────────────────────
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
  return found ? found.label : hex || "Unknown"; // fallback to hex itself
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
  columns: {
    label: string;
    render: (s: ProductStat) => React.ReactNode;
    align?: string;
  }[];
}) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg p-6 relative overflow-hidden h-full transition-colors">
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-[50px] pointer-events-none`}
      />
      <h3
        className={`text-xl font-bold ${accentColor} mb-6 flex items-center gap-2`}
      >
        {icon}
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 ${col.align ?? ""} ${i === 0 ? "rounded-tl-lg" : ""} ${i === columns.length - 1 ? "rounded-tr-lg" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-neutral-600 italic text-xs"
                >
                  No orders processed yet
                </td>
              </tr>
            ) : (
              rows.map((stat) => (
                <tr
                  key={stat.name}
                  className="hover:bg-neutral-800/20 transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.label}
                      className={`px-4 py-3 align-top ${col.align ?? ""}`}
                    >
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

  const [products, registrations, settingsDoc] = await Promise.all([
    Product.find().lean(),
    Registration.find({ paymentStatus: true }).lean(),
    Settings.findOne().lean(),
  ]);

  const meshColors: { label: string; value: string }[] =
    settingsDoc?.meshColors ?? [];

  const statMap = new Map<string, ProductStat>(
    products.map((p) => [
      p._id.toString(),
      {
        name: p.name,
        category: p.category,
        count: 0,
        revenue: 0,
        colorSizes: [],
      },
    ]),
  );

  for (const reg of registrations) {
    // 1. Process New Multi-Merch Array
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
          const key = `${colorName}|${sizeName}`;

          const existing = stat.colorSizes!.find(
            (cs) => `${cs.color}|${cs.size}` === key,
          );

          if (existing) {
            existing.qty += qty;
            if (item.inscriptions) existing.inscriptions.push(item.inscriptions);
          } else {
            stat.colorSizes!.push({
              color: colorName,
              size: sizeName,
              qty,
              hex: item.color,
              inscriptions: item.inscriptions ? [item.inscriptions] : [],
            });
          }
        }
      }
    } else if (reg.meshSelection) {
      // 2. Legacy Fallback: Process Single Mesh Selection
      const id = toId(reg.meshSelection);
      const stat = statMap.get(id);
      if (stat) {
        const qty = reg.meshQuantity ?? 1;
        const prod = products.find((p) => p._id.toString() === id);
        stat.count += qty;
        stat.revenue += (prod?.price ?? 0) * qty;

        if (reg.meshColor || reg.meshSize) {
          const colorName = getColorLabel(reg.meshColor ?? "", meshColors);
          const sizeName = reg.meshSize ?? "Standard";
          const key = `${colorName}|${sizeName}`;

          const existing = stat.colorSizes!.find(
            (cs) => `${cs.color}|${cs.size}` === key,
          );

          if (existing) {
            existing.qty += qty;
            if (reg.meshInscriptions)
              existing.inscriptions.push(reg.meshInscriptions);
          } else {
            stat.colorSizes!.push({
              color: colorName,
              size: sizeName,
              qty,
              hex: reg.meshColor,
              inscriptions: reg.meshInscriptions ? [reg.meshInscriptions] : [],
            });
          }
        }
      }
    }

    // 3. Accumulate Food/Drinks
    for (const foodId of reg.foodSelections ?? []) {
      const stat = statMap.get(toId(foodId));
      if (stat) stat.count += 1;
    }
    if (reg.drinkSelection) {
      const stat = statMap.get(toId(reg.drinkSelection));
      if (stat) stat.count += 1;
    }
  }

  const all = [...statMap.values()];
  const meshStats = all
    .filter((p) => p.category === "mesh")
    .sort((a, b) => b.count - a.count);
  const foodStats = all
    .filter((p) => p.category === "food" || p.category === "drink")
    .sort((a, b) => b.count - a.count);

  const meshIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  const foodIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  );

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Inventory & <span className="text-amber-500">Orders</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm">
          Quantities calculated from successful payments only.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <InventoryTable
          title="Merch Allocations"
          icon={meshIcon}
          accentColor="text-amber-500"
          glowColor="bg-amber-500/5"
          rows={meshStats}
          columns={[
            {
              label: "Item",
              render: (s) => (
                <span className="font-bold text-white block">{s.name}</span>
              ),
            },
            {
              label: "Variants & Inscriptions",
              render: (s) => (
                <div className="flex flex-col gap-4">
                  {s.colorSizes && s.colorSizes.length > 0 ? (
                    s.colorSizes.map((cs) => (
                      <div
                        key={`${cs.color}-${cs.size}`}
                        className="space-y-2 border-l border-neutral-800 pl-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full border border-white/10 shrink-0"
                            style={{ backgroundColor: cs.hex }}
                          />
                          <span className="text-neutral-300 text-[11px] font-semibold uppercase tracking-tight">
                            {cs.color}{" "}
                            <span className="text-neutral-600 mx-0.5">|</span>{" "}
                            {cs.size}
                          </span>
                          <span className="text-amber-500 font-bold text-xs ml-auto">
                            ×{cs.qty}
                          </span>
                        </div>

                        {cs.inscriptions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cs.inscriptions.map((text, idx) => (
                              <span
                                key={idx}
                                className="bg-neutral-800 text-amber-500/80 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20 italic"
                              >
                                &quot;{text}&quot;
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-neutral-600 text-[11px]">—</span>
                  )}
                </div>
              ),
            },
            {
              label: "Total Qty",
              render: (s) => (
                <span className="font-black text-white text-lg">{s.count}</span>
              ),
              align: "text-right",
            },
            {
              label: "Revenue",
              render: (s) => (
                <span className="font-mono text-neutral-400 text-xs tabular-nums">
                  ₦{s.revenue.toLocaleString()}
                </span>
              ),
              align: "text-right",
            },
          ]}
        />

        <InventoryTable
          title="Food and Drink Requirements"
          icon={foodIcon}
          accentColor="text-emerald-500"
          glowColor="bg-emerald-500/5"
          rows={foodStats}
          columns={[
            {
              label: "Item Name",
              render: (s) => (
                <span className="font-bold text-white">{s.name}</span>
              ),
            },
            {
              label: "Category",
              render: (s) => (
                <span className="uppercase text-[10px] font-black tracking-widest text-neutral-600">
                  {s.category}
                </span>
              ),
            },
            {
              label: "Count",
              render: (s) => (
                <span className="font-black text-emerald-400 text-lg">
                  {s.count}
                </span>
              ),
              align: "text-right",
            },
          ]}
        />
      </div>
    </div>
  );
}
