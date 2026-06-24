import { db, eq } from "@repo/database";
import { workspaceMembersTable } from "@repo/database/schema";
import { redirect } from "next/navigation";
import { FeatureRequestsList } from "~/features/requests/components/requests-list";
import { getServerSession } from "~/lib/auth-server";

export default async function FeatureRequestsPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/sign-in?callbackUrl=/dashboard/feature-requests");
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <FeatureRequestsList organizationId={organizationId} />
    </div>
  );
}
