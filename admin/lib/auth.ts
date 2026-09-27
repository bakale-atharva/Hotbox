import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Resource-level admin check for Server Components. Signed-out users go to
 * sign-in; signed-in non-admins go to /unauthorized. Convex re-checks the
 * role on every admin function, which is the real security boundary.
 */
export async function requireAdmin() {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();
  if (sessionClaims?.metadata?.role !== "admin") redirect("/unauthorized");
}
