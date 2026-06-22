"use client";

import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Sign in to Taarana</h1>
        <Button
          onClick={() =>
            signIn.social({
              provider: "github",
              callbackURL: "/dashboard",
            })
          }
        >
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}