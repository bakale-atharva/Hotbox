import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk only attaches auth state here. Access is enforced per resource
// (see lib/auth.ts, used by the (dashboard) layout), following Clerk's
// migration away from createRouteMatcher().
export default clerkMiddleware({ signInUrl: "/sign-in" });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
