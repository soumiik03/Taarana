import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBackendUrl } from "~/lib/api-url";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in"];
const onboardingRoutes = ["/create-workspace"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Middleware Proxy] 1. pathname:", pathname);

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  console.log("[Middleware Proxy] 2. cookies received in request:", request.cookies.getAll().map(c => `${c.name}=${c.value}`));
  console.log("[Middleware Proxy] 3. session cookie value:", sessionCookie);
  console.log("[Middleware Proxy] 4. request.headers.cookie:", request.headers.get("cookie"));

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
      const url = `${getBackendUrl()}/api/auth/get-session`;
      console.log("[Middleware Proxy] Fetching session from:", url);
      // Fetch session directly from the dynamically resolved API server
      const res = await fetch(url, {
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      console.log("[Middleware Proxy] 6. response status:", res.status);
      if (res.ok) {
        const session = await res.json();
        console.log("[Middleware Proxy] 7. parsed session object:", JSON.stringify(session));
        if (session?.user?.id) {
          isValidSession = true;
        }
      } else {
        const text = await res.text();
        console.log("[Middleware Proxy] 5. response from /api/auth/get-session (error):", text);
      }
    } catch (e) {
      console.error("[Middleware Proxy] Error validating session in proxy:", e);
    }
  }

  console.log("[Middleware Proxy] 8. final value of isValidSession:", isValidSession);

  // Not logged in (or invalid session) → redirect to sign-in with callback and clear cookies
  if (isProtectedRoute && !isValidSession) {
    console.log("[Middleware Proxy] 9. exact if statement that returns the redirect: isProtectedRoute && !isValidSession evaluated true.");
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
      console.log("[Middleware Proxy] redirecting authenticated user away from auth route to /dashboard");
      // Already logged in → redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (sessionCookie) {
      console.log("[Middleware Proxy] clearing stale session cookie on auth route");
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
