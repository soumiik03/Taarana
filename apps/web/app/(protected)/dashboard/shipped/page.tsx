import { db, eq } from "@repo/database";
import { workspaceMembersTable } from "@repo/database/schema";
import { redirect } from "next/navigation";
import { ShippedView } from "~/features/shipped/components/shipped-view";
import { getServerSession } from "~/lib/auth-server";

export default async function ShippedPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/sign-in?callbackUrl=/dashboard/shipped");
  }

  const membership = await db
    .select({ organizationId: workspaceMembersTable.organizationId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.userId, session.user.id))
    .limit(1);

  const organizationId = membership[0]?.organizationId;

  if (!organizationId) {
    redirect("/create-workspace");
  }

  return <ShippedView organizationId={organizationId} />;
}

