/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_ADMIN_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // 1. Check if the user is allowed to sign in
    async signIn({ user }) {
      if (user.email && ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return true;
      }
      return '/unauthorized'; // Redirects blocked users
    },

    // 2. Attach the 'role' to the JWT token
    async jwt({ token, user }) {
      if (user && user.email) {
        if (ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          token.role = 'admin';
        } else {
          token.role = 'user';
        }
      }
      return token;
    },

    // 3. Pass the 'role' from the JWT to the Session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
});