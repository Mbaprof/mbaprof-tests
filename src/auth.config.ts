import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the Auth.js config — used directly by middleware.
// Deliberately has NO dependency on Prisma or bcrypt (both are Node-only and
// bloat the Edge Function bundle past Vercel's size limit). The Credentials
// provider itself, which needs both, lives only in the full config (auth.ts)
// used by server components, route handlers, and server actions.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/student")) return isLoggedIn;
      if (pathname.startsWith("/exam")) return isLoggedIn;
      if (pathname.startsWith("/admin")) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
