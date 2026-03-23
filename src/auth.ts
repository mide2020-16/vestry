import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_ADMIN_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        return true;
      }
      return '/unauthorized';
    },
  },
  pages: {
    signIn: '/admin/login',
  },
});