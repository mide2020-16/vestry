/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User, { UserRole } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: (credentials.email as string).toLowerCase() });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        // Verify 2FA if enabled
        if (user.twoFactorEnabled) {
          const { verifyTOTP } = await import("@/lib/totp");
          const token = credentials.twoFactorCode as string;
          
          if (!token) {
             throw new Error("2FA_REQUIRED");
          }

          const is2FAValid = verifyTOTP(token, user.twoFactorSecret);

          if (!is2FAValid) {
            throw new Error("INVALID_2FA");
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Update last login for all users on sign in
      await User.findOneAndUpdate(
        { email },
        { lastLogin: new Date() }
      );

      if (account?.provider === "google") {
        let existingUser = await User.findOne({ email });
        
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email,
            image: user.image,
            role: UserRole.END_USER,
            lastLogin: new Date(),
          });
        }
        
        (user as any).role = existingUser.role;
        (user as any).id = existingUser._id.toString();
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Handle session updates from frontend update() call
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
        if (session.role) token.role = session.role;
      }

      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id || user.id;
        token.picture = (user as any).image || user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/signout",
  },
});