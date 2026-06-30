import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBackendUrl } from "~/lib/api-url";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in"];
const onboardingRoutes = ["/create-workspace"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );

  let isValidSession = false;
  if (sessionCookie) {
    try {
      // Fetch session directly from the dynamically resolved API server
      const res = await fetch(`${getBackendUrl()}/api/auth/get-session`, {
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      if (res.ok) {
        const session = await res.json();
        if (session?.user?.id) {
          isValidSession = true;
        }
      }
    } catch (e) {
      console.error("Error validating session in proxy:", e);
    }
  }

  // Not logged in (or invalid session) → redirect to sign-in with callback and clear cookies
  if (isProtectedRoute && !isValidSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(signInUrl);
    
    // Clean up invalid session cookies
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("__Secure-better-auth.session_token");
    return response;
  }

  // Auth route handling
  if (isAuthRoute) {
    if (isValidSession) {
      // Already logged in → redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (sessionCookie) {
      // Stale/invalid cookie present → clear it so the sign-in page can render clean
      const response = NextResponse.next();
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("__Secure-better-auth.session_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
