import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/auth";
import User from "@/models/User";

export async function logActivity({
  action,
  resource,
  resourceId,
  details,
  metadata,
  userType = UserType.SYSTEM,
  userId,
  userName,
  userEmail,
  sessionId
}: {
  action: LogAction;
  resource: string;
  resourceId?: string;
  details: string;
  metadata?: any;
  userType?: UserType;
  userId?: string;
  userName?: string;
  userEmail?: string;
  sessionId?: string;
}) {
  try {
    await dbConnect();
    
    // If no user info provided, try to get from session
    let finalUserId = userId;
    let finalUserName = userName;
    let finalUserEmail = userEmail;
    let finalUserType = userType;

    if (!finalUserId) {
      const session = await auth();
      if (session?.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).lean() as any;
        if (dbUser) {
          finalUserId = dbUser._id.toString();
          finalUserName = dbUser.name;
          finalUserEmail = dbUser.email;
          finalUserType = UserType.ADMIN;
        }
      }
    }

    return await ActivityLog.create({
      userId: finalUserId,
      userType: finalUserType,
      userName: finalUserName,
      userEmail: finalUserEmail,
      sessionId,
      action,
      resource,
      resourceId,
      details,
      metadata
    });
  } catch (error) {
    console.error("Activity Logging Error:", error);
  }
}
