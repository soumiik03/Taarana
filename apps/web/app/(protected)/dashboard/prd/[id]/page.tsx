import { PrdEditor } from "~/features/prd/components/prd-editor";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";

export default async function PrdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Fetch the PRD data
  const prd = await api.prd.getByFeatureRequest.query({ featureRequestId: id });

  if (!prd) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">PRD not generated yet</h1>
        <p className="mt-1 text-sm text-zinc-400">
          The PRD for this feature request is currently being generated or hasn't started. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Product Requirements Document</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review and edit the AI-generated PRD. Approve it when ready to move
          to engineering tasks.
        </p>
      </div>
      <PrdEditor prd={prd as any} />
    </div>
  );
}
