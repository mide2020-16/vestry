import Event from "@/models/Event";
import dbConnect from "@/lib/dbConnect";

/**
 * Calculates the total registration price on the server.
 * This function uses direct database access via Mongoose and can ONLY
 * be called in server environments (API Routes, Server Actions, Server Components).
 */
export async function calculateRegistrationTotal(
  eventId: string,
  ticketTypeName: string
): Promise<number> {
  await dbConnect();

  const event = await Event.findById(eventId).lean();
  if (!event || !event.config?.ticketTypes) {
    return 0;
  }

  const ticketType = event.config.ticketTypes.find(
    (t: { name: string; price: number }) => t.name.toLowerCase() === ticketTypeName.toLowerCase()
  );

  return ticketType ? ticketType.price : 0;
}
