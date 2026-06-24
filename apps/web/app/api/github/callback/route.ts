import { NextRequest, NextResponse } from "next/server";
import { saveInstallationId } from "~/features/github/server/installation";
import { authClient } from "~/lib/auth-client";

/**
 * GitHub App installation callback handler.
 *
 * After a user installs the GitHub App on their account/org,
 * GitHub redirects here with ?installation_id=<id>&setup_action=install.
 * We save the installation ID against the user's organization.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");

  // Validate required params
  if (!installationId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_installation_id", request.url)
    );
  }

  try {
    // Get the current user's session from cookies
    const cookieHeader = request.headers.get("cookie") ?? "";
    const sessionResponse = await fetch(
      `${getBaseURL(request)}/api/auth/get-session`,
      {
        headers: { cookie: cookieHeader },
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.redirect(
        new URL("/sign-in?callbackUrl=/dashboard", request.url)
      );
    }

    const session = await sessionResponse.json();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?callbackUrl=/dashboard", request.url)
      );
    }

    // Save the installation ID against the user's organization
    const result = await saveInstallationId(userId, parseInt(installationId, 10));

    if (!result.success) {
      console.error("Failed to save installation:", result.error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(result.error || "install_failed")}`, request.url)
      );
    }

    // Success — redirect to dashboard with success indicator
    return NextResponse.redirect(
      new URL("/dashboard?github=connected", request.url)
    );
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=callback_failed", request.url)
    );
  }
}

/**
 * Constructs the base URL for internal API calls.
 * Uses the request's origin since rewrites will forward to the API server.
 */
function getBaseURL(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
