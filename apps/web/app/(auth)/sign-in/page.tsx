import { Suspense } from "react";
import { AuthCard } from "~/components/auth-card";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
        </div>
      }
    >
      <AuthCard />
    </Suspense>
  );
}