/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";

export async function getRegistrationEndDate(eventId: string): Promise<Date | null> {
  await dbConnect();
  const event = await Event.findById(eventId).lean() as any;
  if (!event?.endDate) return null;
  return new Date(event.endDate);
}

export async function isRegistrationOpen(eventId: string): Promise<boolean> {
  const endDate = await getRegistrationEndDate(eventId);
  if (!endDate) return true; // no deadline set → open
  return new Date() < endDate;
}