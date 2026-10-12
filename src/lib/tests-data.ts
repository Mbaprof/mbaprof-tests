import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

// The header on every marketing page checks auth() (reads cookies), which
// already forces those pages to render dynamically per-request — so this
// cache doesn't buy static generation. What it does buy: skipping the
// Postgres round-trip to Supabase on every single request. Invalidated
// on-demand via revalidateTag("tests") whenever a test is created, edited,
// published, unpublished, or deleted (see src/app/admin/tests/actions.ts).
export const getPublishedTests = unstable_cache(
  async () => {
    return prisma.test.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        sections: { select: { _count: { select: { questions: true } } } },
      },
    });
  },
  ["published-tests"],
  { revalidate: 60, tags: ["tests"] }
);
