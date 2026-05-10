/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { StatCard, SplitStat } from "@/components/admin/StatCard";
import { RecentRegistrations } from "@/components/admin/RecentRegistration";
import DownloadButton, { type RegistrationForPDF } from "@/components/admin/DownloadButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/models/User";
import EventSwitcher from "@/components/admin/EventSwitcher";
import ShareEventModal from "@/components/admin/ShareEventModal";
import Event from "@/models/Event";
import { TrendingUp, Users, Ticket, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; page?: string; search?: string; status?: string; ticketType?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const searchParamsData = await searchParams;
  const eventId = searchParamsData.eventId;

  await dbConnect();

  const query: any = {};
  
  const User = (await import("@/models/User")).default;
  const dbUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-2xl font-black">Account Configuration Issue</h2>
        <p className="text-muted-foreground">Your email was authenticated but we couldn&lsquot;t find your administrative record. Please contact the system owner.</p>
        <Link href="/admin/signout" className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold">Sign Out</Link>
      </div>
    );
  }

  if (dbUser.role !== UserRole.SUPER_ADMIN) {
    const managedEventIds = dbUser.managedEvents?.map((id: any) => id.toString()) || [];
    if (eventId) {
      if (!managedEventIds.includes(eventId)) redirect("/unauthorized");
      query.eventId = eventId;
    } else if (managedEventIds.length > 0) {
      query.eventId = managedEventIds[0];
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </div>
          <h2 className="text-4xl font-black text-foreground">Welcome to Vestry</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don&lsquot;t have any events yet. Create your first event to start accepting registrations, selling merchandise, and managing attendees.
          </p>
          <Link href="/admin/events" className="mt-4 px-8 py-4 bg-amber-500 text-amber-950 hover:bg-amber-400 font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:scale-105">
            Create Your First Event
          </Link>
        </div>
      );
    }
  } else if (eventId) {
    query.eventId = eventId;
  }

  let currentEvent = null;
  if (query.eventId) {
    currentEvent = await Event.findById(query.eventId).lean() as any;
  }

  const statsPipeline = [
    { $match: { ...query, eventId: query.eventId ? new (await import("mongoose")).default.Types.ObjectId(query.eventId) : { $exists: true } } },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $or: [{ $eq: ["$status", "success"] }, { $eq: ["$paymentStatus", true] }] }, "$totalAmount", 0] }
        },
        totalAttendees: {
          $sum: {
            $cond: [
              { $and: [{ $or: [{ $eq: ["$status", "success"] }, { $eq: ["$paymentStatus", true] }] }, { $ne: ["$ticketType", "none"] }] },
              { $cond: [{ $eq: ["$ticketType", "couple"] }, 2, 1] },
              0
            ]
          }
        },
        singleTickets: {
          $sum: {
            $cond: [{ $and: [{ $or: [{ $eq: ["$status", "success"] }, { $eq: ["$paymentStatus", true] }] }, { $eq: ["$ticketType", "single"] }] }, 1, 0]
          }
        },
        coupleTickets: {
          $sum: {
            $cond: [{ $and: [{ $or: [{ $eq: ["$status", "success"] }, { $eq: ["$paymentStatus", true] }] }, { $eq: ["$ticketType", "couple"] }] }, 1, 0]
          }
        },
        successfulPayments: {
          $sum: { $cond: [{ $or: [{ $eq: ["$status", "success"] }, { $eq: ["$paymentStatus", true] }] }, 1, 0] }
        },
        totalRegistrations: { $sum: 1 }
      }
    }
  ];

  const [statsResult] = await Registration.aggregate(statsPipeline);
  const stats = statsResult || {
    totalRevenue: 0, totalAttendees: 0, singleTickets: 0, coupleTickets: 0, successfulPayments: 0, totalRegistrations: 0
  };
  const pendingPayments = stats.totalRegistrations - stats.successfulPayments;

  // --- 10M SCALE PAGINATION ---
  const page = parseInt(searchParamsData.page || "0", 10);
  const search = searchParamsData.search || "";
  const statusFilter = searchParamsData.status || "all";
  const ticketTypeFilter = searchParamsData.ticketType || "all";

  const tableQuery = { ...query };
  
  if (search) {
    tableQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  
  if (statusFilter === "paid") {
    // Because we cannot push to an existing $or safely, we use $and
    tableQuery.$and = [...(tableQuery.$and || []), { $or: [{ status: "success" }, { paymentStatus: true }] }];
  } else if (statusFilter === "pending") {
    tableQuery.status = "pending";
    tableQuery.paymentStatus = false;
  } else if (statusFilter === "declined") {
    tableQuery.status = "declined";
  }

  if (ticketTypeFilter !== "all") {
    tableQuery.ticketType = ticketTypeFilter === "merch" ? "none" : ticketTypeFilter;
  }

  const PAGE_SIZE = 50;
  const totalFilteredCount = await Registration.countDocuments(tableQuery);
  const totalPages = Math.ceil(totalFilteredCount / PAGE_SIZE) || 1;
  const validPage = Math.min(page, Math.max(0, totalPages - 1));

  const rawTable = await Registration.find(tableQuery)
    .populate("meshSelection", "name")
    .populate("merch.productId", "name")
    .sort({ createdAt: -1 })
    .skip(validPage * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const registrations = rawTable.map((r: any) => ({
    _id: r._id.toString(),
    name: r.name,
    email: r.email,
    ticketType: r.ticketType,
    status: r.status ?? "pending",
    declineReason: r.declineReason ?? null,
    meshSelection: r.meshSelection ? { name: (r.meshSelection as any).name } : null,
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
    foodSelections: (r.foodSelections ?? []).map((id: any) => id.toString()),
    drinkSelection: (r.drinkSelection ?? []).map((id: any) => id.toString()),
    paymentStatus: r.paymentStatus,
    paymentMethod: r.paymentMethod ?? null,
    paymentReceiptUrl: r.paymentReceiptUrl ?? null,
    paystackReference: r.paystackReference ?? null,
    totalAmount: r.totalAmount ?? 0,
    aiVerificationResult: r.aiVerificationResult ? { ...r.aiVerificationResult } : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  }));

  // Limit PDF download data to prevent OOM
  const pdfRaw = await Registration.find({
    ...query,
    $or: [{ status: "success" }, { paymentStatus: true }]
  })
    .limit(2000)
    .populate("meshSelection", "name")
    .populate("merch.productId", "name")
    .lean();

  const registrationsForPDF: RegistrationForPDF[] = pdfRaw.map((r: any) => ({
    _id: r._id.toString(),
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
        <div className="flex items-center gap-4">
           <EventSwitcher />
           {currentEvent && <ShareEventModal eventSlug={currentEvent.slug} />}
           <DownloadButton registrations={registrationsForPDF} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`₦${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="text-amber-500"
          accentColor="bg-amber-500/5" 
        />
        
        <StatCard 
          label="Total Attendees" 
          value={stats.totalAttendees.toString()}
          icon={Users}
          color="text-emerald-400"
          accentColor="bg-emerald-500/5" 
        />
        
        <StatCard 
          label="Ticket Types" 
          icon={Ticket}
          color="text-blue-400"
          accentColor="bg-blue-500/5"
        >
          <SplitStat
            left={{ value: stats.singleTickets, label: "Singles" }}
            right={{ value: stats.coupleTickets, label: "Couples" }}
          />
        </StatCard>
        
        <StatCard 
          label="Payment Status" 
          icon={CreditCard}
          color="text-purple-400"
          accentColor="bg-purple-500/5"
        >
          <SplitStat
            left={{ value: stats.successfulPayments, label: "Paid", className: "text-emerald-400" }}
            right={{ value: pendingPayments, label: "Pending", className: "text-muted-foreground" }}
          />
        </StatCard>
      </div>

      <div className="bg-card/40 border border-border rounded-3xl p-1 md:p-6 transition-colors">
        <RecentRegistrations 
          registrations={registrations} 
          totalPages={totalPages}
          currentPage={validPage}
          searchParamValues={{ search, status: statusFilter, ticketType: ticketTypeFilter }}
        />
      </div>
    </div>
  );
}
