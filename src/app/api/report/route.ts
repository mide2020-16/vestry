/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { 
  fetchConfirmedRegistrations, 
  generateRegistryBuffer, 
  sendRegistryEmail 
} from "@/lib/registryService";

export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await fetchConfirmedRegistrations();

    if (!registrations || registrations.length === 0) {
      return Response.json(
        { success: false, error: "No confirmed registrations found." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateRegistryBuffer(registrations);
    await sendRegistryEmail(pdfBuffer, registrations.length);

    return Response.json({
      success: true,
      message: "Registry report emailed successfully",
    });

  } catch (error: any) {
    console.error("Registry Report Error:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}