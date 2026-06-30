import { NextRequest, NextResponse } from "next/server";
import { saveInstallationId } from "~/features/github/server/installation";
import { authClient } from "~/lib/auth-client";
import { getBackendUrl } from "~/lib/api-url";

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

  console.log(`[GitHub Callback] setupAction: ${setupAction}, installationId: ${installationId}`);

  // Validate required params
  if (!installationId) {
    console.error("[GitHub Callback] Missing installation_id parameter");
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_installation_id", getBaseURL(request))
    );
  }

  try {
    // Get the current user's session from cookies
    const cookieHeader = request.headers.get("cookie") ?? "";
    const sessionResponse = await fetch(
      `${getBackendUrl()}/api/auth/get-session`,
      {
        headers: { cookie: cookieHeader },
      }
    );

    console.log(`[GitHub Callback] Session request status: ${sessionResponse.status}`);

    if (!sessionResponse.ok) {
      console.warn("[GitHub Callback] Session request not OK");
      return NextResponse.redirect(
        new URL("/sign-in?callbackUrl=/dashboard", getBaseURL(request))
      );
    }

    const session = await sessionResponse.json();
    const userId = session?.user?.id;

    console.log(`[GitHub Callback] Session parsed. userId: ${userId}`);

    if (!userId) {
      console.warn("[GitHub Callback] No userId in session, redirecting to sign-in");
      return NextResponse.redirect(
        new URL("/sign-in?callbackUrl=/dashboard", getBaseURL(request))
      );
    }

    // Save the installation ID against the user's organization
    console.log(`[GitHub Callback] Attempting to save installationId: ${installationId} for userId: ${userId}`);
    const result = await saveInstallationId(userId, parseInt(installationId, 10));
    console.log(`[GitHub Callback] Save result:`, result);

    if (!result.success) {
      console.error("Failed to save installation:", result.error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(result.error || "install_failed")}`, getBaseURL(request))
      );
    }

    // Success — redirect to dashboard with success indicator
    return NextResponse.redirect(
      new URL("/dashboard?github=connected", getBaseURL(request))
    );
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=callback_failed", getBaseURL(request))
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
