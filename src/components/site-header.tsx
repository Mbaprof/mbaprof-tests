import { auth } from "@/auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const session = await auth();
  const sessionInfo = session?.user
    ? { name: session.user.name ?? "", role: session.user.role }
    : null;

  return <SiteHeaderClient session={sessionInfo} />;
}
