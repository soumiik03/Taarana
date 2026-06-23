import { WorkspaceForm } from "../../../features/workspace/components/workspace-form";

export default function CreateWorkspacePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-2xl font-bold">Create your workspace</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Your workspace is where your team manages features, reviews, and shipments.
        </p>
        <WorkspaceForm />
      </div>
    </div>
  );
}
