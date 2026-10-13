import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Deliberately built from the edge-safe authConfig, not the full auth.ts —
// pulling in Prisma/bcrypt here blows past Vercel's Edge Function size
// limit. See auth.config.ts for why.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/student/:path*", "/exam/:path*", "/admin/:path*"],
};
