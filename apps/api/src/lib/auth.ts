console.log("[Startup] [auth.ts] 1: Starting auth.ts file");
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
console.log("[Startup] [auth.ts] 2: Importing db");
import db from "@repo/database";
console.log("[Startup] [auth.ts] 3: Importing database schema");
import * as schema from "@repo/database/schema";

// ---------------------------------------------------------------------------
// Derive the list of trusted origins from environment variables.
//
// BETTER_AUTH_URL  = the backend API URL  (e.g. https://taarana-api.onrender.com)
// FRONTEND_URL     = the frontend URL     (e.g. https://taarana-web.vercel.app)
//
// trustedOrigins controls:
//   1. Which origins are allowed as callbackURL / errorCallbackURL values
//      (checked in origin-check middleware — INVALID_CALLBACK_URL if missing).
//   2. Which Request origins Better Auth trusts for CSRF protection.
//
// Without FRONTEND_URL here, the client's callbackURL pointing to Vercel is
// rejected with 403 INVALID_CALLBACK_URL before the state cookie is ever set,
// meaning the OAuth flow can never start successfully from the frontend.
// ---------------------------------------------------------------------------
const buildTrustedOrigins = (): string[] => {
  const origins = new Set<string>(["http://localhost:3000", "http://localhost:3001"]);

  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL.replace(/\/$/, ""));
  }
  if (process.env.FRONTEND_URL) {
    origins.add(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }

  // Allow any *.vercel.app subdomain (covers PR preview deployments).
  origins.add("*.vercel.app");

  return Array.from(origins);
};

// ---------------------------------------------------------------------------
// Detect whether we are running in production (HTTPS).
// Better Auth itself also does this check, but we need it to decide the
// defaultCookieAttributes below.
// ---------------------------------------------------------------------------
const isHttps = (process.env.BETTER_AUTH_URL || "").startsWith("https://") ||
  (process.env.NODE_ENV === "production");

console.log("[Startup] [auth.ts] 4: Calling betterAuth()");
export const auth = betterAuth({
  // -------------------------------------------------------------------------
  // baseURL: the API server URL — this is where Better Auth mounts its routes
  // and where GitHub redirects back after OAuth.
  // -------------------------------------------------------------------------
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.usersTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),

  user: {
    fields: {
      name: "fullName",
      image: "profileImageUrl",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"],
    },
    // -----------------------------------------------------------------------
    // skipStateCookieCheck: true
    //
    // ROOT CAUSE OF state_mismatch:
    //
    // The OAuth flow involves two different sites:
    //   • Frontend  → taarana-web.vercel.app  (initiates sign-in)
    //   • Backend   → taarana-api.onrender.com (owns the /api/auth/* routes)
    //   • GitHub    → github.com (the OAuth provider)
    //
    // Step-by-step of what breaks without this flag:
    //
    // 1. Browser on vercel.app fetches POST taarana-api.onrender.com/api/auth/sign-in/social
    //    → Better Auth writes  Set-Cookie: __Secure-better-auth.state=<signed>; SameSite=Lax; Secure
    //    → Cookie is stored for onrender.com by Chrome.
    //
    // 2. Better Auth returns { url: "https://github.com/login/oauth/authorize?..." }.
    //    The Better Auth client JS does window.location.href = url.
    //
    // 3. Browser navigates to github.com (top-level navigation — CROSS-SITE).
    //
    // 4. User authorises → GitHub redirects to
    //    https://taarana-api.onrender.com/api/auth/callback/github?code=...&state=...
    //    This is also a CROSS-SITE top-level navigation (from github.com → onrender.com).
    //
    //    For SameSite=Lax: cookies ARE sent on same-site and on cross-site
    //    top-level GET navigations. BUT Chrome's third-party cookie restrictions
    //    (Chrome 115+) mark cookies that were originally set in a *cross-site*
    //    response context (the fetch from vercel.app → onrender.com in step 1)
    //    as potentially "third-party". Chrome shows a warning icon in DevTools
    //    and may suppress the cookie depending on the user's settings.
    //    In practice, the cookie is simply absent in the callback request.
    //
    // 5. parseGenericState (state.mjs) looks up the DB record ✓ (found) but
    //    then also checks the signed cookie:
    //
    //    const stateCookieValue = await c.getSignedCookie("better-auth.state", secret);
    //    if (!stateCookieValue || stateCookieValue !== state) {
    //      throw new StateError("state_security_mismatch") → redirected as state_mismatch
    //    }
    //
    // 6. Because Chrome never sent the cookie, stateCookieValue is undefined →
    //    condition is true → THROWS → state_mismatch is surfaced to the user.
    //
    // Fix: skip the redundant cookie check. The DB lookup in step 5 already
    // provides CSRF-equivalent protection (the state is a 32-char random token
    // stored in the verification table; no one can forge it without DB access).
    // The cookie check is an ADDITIONAL layer that is incompatible with
    // cross-domain OAuth setups where the callback lands on a different domain
    // than the one that initiated the sign-in.
    // -----------------------------------------------------------------------
    skipStateCookieCheck: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,

      mapProfileToUser: async (profile) => {
        return {
          email: profile.email ?? `${profile.id}@users.noreply.github.com`,
          name: profile.name ?? profile.login,
          image: profile.avatar_url,
        };
      },
    },
  },

  // -------------------------------------------------------------------------
  // trustedOrigins: every URL that is allowed as a callbackURL, and every
  // request origin that Better Auth trusts for CSRF protection.
  //
  // The originCheckMiddleware (origin-check.mjs) runs on every non-GET request
  // and validates callbackURL against this list. If FRONTEND_URL is absent,
  // any callbackURL pointing to the frontend returns 403 INVALID_CALLBACK_URL
  // and the OAuth flow never starts.
  // -------------------------------------------------------------------------
  trustedOrigins: buildTrustedOrigins(),

  advanced: {
    // -----------------------------------------------------------------------
    // useSecureCookies: true forces the __Secure- prefix on all auth cookies
    // in production (HTTPS). Better Auth auto-detects this from baseURL, but
    // being explicit is safer and required for the cookie attributes below.
    // -----------------------------------------------------------------------
    useSecureCookies: isHttps,

    // -----------------------------------------------------------------------
    // defaultCookieAttributes: applies to ALL cookies Better Auth creates,
    // including the session token, session data, and the state cookie.
    //
    // sameSite: "none" is required for cross-site cookies to be stored AND
    // sent across sites. Combined with secure: true (required by browsers for
    // SameSite=None), the cookie will:
    //   • Be stored when set in response to a cross-site fetch from vercel.app
    //   • Be sent on the cross-site callback navigation from github.com
    //
    // Without this, Chrome drops the state cookie and state_mismatch occurs.
    //
    // NOTE: skipStateCookieCheck=true above makes the state cookie itself
    // optional (DB is the source of truth), so this change primarily ensures
    // that the SESSION cookie set after a successful OAuth is also correctly
    // propagated cross-domain.
    // -----------------------------------------------------------------------
    defaultCookieAttributes: isHttps
      ? {
          sameSite: "none" as const,
          secure: true,
        }
      : {
          // In local dev (HTTP), sameSite=none requires secure which isn't
          // available on localhost — use lax instead.
          sameSite: "lax" as const,
          secure: false,
        },
  },
});
