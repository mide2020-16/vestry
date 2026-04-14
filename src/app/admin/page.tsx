/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { StatCard, SplitStat } from "@/components/admin/StatCard";
import { RecentRegistrations } from "@/components/admin/RecentRegistration";
import DownloadButton, { type RegistrationForPDF } from "@/components/admin/DownloadButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await dbConnect();

  const raw = await Registration.find()
    .populate("meshSelection", "name")
    .populate("merch.productId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const registrations = raw.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    email: r.email,
    ticketType: r.ticketType,
    // ── status fields ──────────────────────────────────────────────────────
    status: r.status ?? "pending",
    declineReason: r.declineReason ?? null,
    // ── mesh ───────────────────────────────────────────────────────────────
    meshSelection: r.meshSelection
      ? { name: (r.meshSelection as unknown as { name: string }).name }
      : null,
    meshColor: r.meshColor ?? null,
    meshSize: r.meshSize ?? null,
    meshInscriptions: r.meshInscriptions ?? null,
    merch: (r.merch ?? []).map((m: any) => ({
      name: m.productId?.name ?? "Unknown",
      quantity: m.quantity,
      color: m.color,
      size: m.size,
      inscriptions: m.inscriptions,
    })),
    foodSelections: (r.foodSelections ?? []).map((id: unknown) =>
      typeof id === "object" && id !== null && "toString" in id
        ? (id as { toString(): string }).toString()
        : String(id)
    ),
    drinkSelection: r.drinkSelection ? r.drinkSelection.toString() : null,
    // ── payment ────────────────────────────────────────────────────────────
    paymentStatus: r.paymentStatus,
    paymentMethod: r.paymentMethod ?? null,
    paymentReceiptUrl: r.paymentReceiptUrl ?? null,
    paystackReference: r.paystackReference ?? null,
    totalAmount: r.totalAmount ?? 0,
    // ── AI verification ────────────────────────────────────────────────────
    aiVerificationResult: r.aiVerificationResult
      ? {
          verified: r.aiVerificationResult.verified,
          confidence: r.aiVerificationResult.confidence,
          extractedAmount: r.aiVerificationResult.extractedAmount ?? null,
          extractedBank: r.aiVerificationResult.extractedBank ?? null,
          extractedAccountName: r.aiVerificationResult.extractedAccountName ?? null,
          reason: r.aiVerificationResult.reason ?? null,
          verifiedAt: r.aiVerificationResult.verifiedAt
            ? r.aiVerificationResult.verifiedAt.toISOString()
            : null,
        }
      : null,
    // ── timestamps ─────────────────────────────────────────────────────────
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  }));

  const isPaid = (r: (typeof registrations)[number]) =>
    r.status === "success" || r.paymentStatus === true || (r.paymentStatus as unknown) === "success";

  const isWithTicket = (r: (typeof registrations)[number]) =>
    r.ticketType !== "none";

  const paidRegistrations = registrations.filter(isPaid);
  const fullyRegistered = registrations.filter(r => isPaid(r) && isWithTicket(r));

  const totalRevenue = paidRegistrations.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  );

  const totalAttendees = fullyRegistered.reduce(
    (sum, r) => sum + (r.ticketType === "couple" ? 2 : 1),
    0
  );

  const singleTickets = fullyRegistered.filter((r) => r.ticketType === "single").length;
  const coupleTickets = fullyRegistered.filter((r) => r.ticketType === "couple").length;
  const successfulPayments = paidRegistrations.length;
  const pendingPayments = registrations.length - successfulPayments;

  const registrationsForPDF: RegistrationForPDF[] = paidRegistrations.map((r) => ({
    _id: r._id,
    name: r.name,
    email: r.email,
    ticketType: r.ticketType,
    meshSelection: r.meshSelection ?? undefined,
    meshSize: r.meshSize ?? undefined,
    meshColor: r.meshColor ?? undefined,
    meshInscriptions: r.meshInscriptions ?? undefined,
    merch: r.merch,
    totalAmount: r.totalAmount,
  }));

  return (
    <div className="space-y-10 pb-20">
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
            left={{ value: singleTickets, label: "Singles" }}
            right={{ value: coupleTickets, label: "Couples" }}
          />
        </StatCard>
        <StatCard label="Payment Status" accentColor="bg-purple-500/5 border-purple-500/10">
          <SplitStat
            left={{ value: successfulPayments, label: "Paid", className: "text-emerald-400" }}
            right={{ value: pendingPayments, label: "Pending", className: "text-muted-foreground" }}
          />
        </StatCard>
      </div>

      <div className="bg-card/40 border border-border rounded-3xl p-1 md:p-6 transition-colors">
        <RecentRegistrations registrations={registrations} />
      </div>
    </div>
  );
}