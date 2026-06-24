import { authClient } from "~/lib/auth-client";
import { api } from "~/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taarana AI - Smart PR Reviews & Code Analysis",
  description: "Automate code reviews, sync GitHub repositories, and get advanced analytics for your workspaces with Taarana AI.",
};

export default async function Home() {
  const { status } = await api.health.getHealth.query();
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Status: {status}</h2>
      </div>
    </main>
  );
}
