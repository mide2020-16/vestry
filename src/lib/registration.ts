import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";

export async function getRegistrationEndDate(): Promise<Date | null> {
  await dbConnect();
  const settings = await Settings.findOne().lean() as { registrationEndDate?: string | Date } | null;
  if (!settings?.registrationEndDate) return null;
  return new Date(settings.registrationEndDate);
}

export async function isRegistrationOpen(): Promise<boolean> {
  const endDate = await getRegistrationEndDate();
  if (!endDate) return true; // no deadline set → open
  return new Date() < endDate;
}