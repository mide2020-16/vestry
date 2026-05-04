import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";

export async function getEventBySlug(slug: string) {
  await dbConnect();
  return await Event.findOne({ slug }).lean();
}

export async function getEventById(id: string) {
  await dbConnect();
  return await Event.findById(id).lean();
}
