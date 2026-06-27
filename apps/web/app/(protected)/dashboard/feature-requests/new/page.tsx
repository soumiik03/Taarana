import { RequestForm } from "~/features/requests/components/request-form";
import { db, eq } from "@repo/database";
import { workspaceMembersTable } from "@repo/database/schema";
import { redirect } from "next/navigation";
import { getServerSession } from "~/lib/auth-server";

export default async function NewFeatureRequestPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/sign-in?callbackUrl=/dashboard/feature-requests/new");
  }

  // Get active organization membership
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Feature Request</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Describe what you want to build. Our AI will ask follow-up questions
          to gather enough context before generating a PRD.
        </p>
      </div>
      <div className="rounded-2xl border border-[#2D2D2D] bg-[#202020] p-8">
        <RequestForm organizationId={organizationId} />
      </div>
    </div>
  );
}