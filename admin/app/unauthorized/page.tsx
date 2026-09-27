import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { HotboxLogo } from "@/components/hotbox-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function UnauthorizedPage() {
  const { isAuthenticated, sessionClaims } = await auth();
  // What the proxy actually saw in the session token.
  const hasMetadataClaim = sessionClaims?.metadata !== undefined;
  const role = sessionClaims?.metadata?.role;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-secondary/40 p-6">
      <HotboxLogo className="text-2xl" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </div>
          <CardTitle>Admins only</CardTitle>
          <CardDescription>
            This account doesn&apos;t have access to the Hotbox admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-medium">Session token check</p>
          <ul className="space-y-2">
            <Check ok={isAuthenticated} label="Signed in" />
            <Check
              ok={hasMetadataClaim}
              label={
                <>
                  Token has a <code className="font-mono">metadata</code> claim
                </>
              }
              hint={
                <>
                  Clerk Dashboard → Sessions → Customize session token → add{" "}
                  <code className="font-mono">{`"metadata": "{{user.public_metadata}}"`}</code>
                </>
              }
            />
            <Check
              ok={role === "admin"}
              label={
                <>
                  <code className="font-mono">metadata.role</code> is{" "}
                  <code className="font-mono">&quot;admin&quot;</code>
                  {hasMetadataClaim && (
                    <span className="text-muted-foreground">
                      {" "}
                      (got {role ? `"${role}"` : "nothing"})
                    </span>
                  )}
                </>
              }
              hint={
                <>
                  Clerk Dashboard → Users → your user → Public metadata →{" "}
                  <code className="font-mono">{`{ "role": "admin" }`}</code>
                </>
              }
            />
          </ul>
          <p className="text-muted-foreground">
            Changed something in Clerk? Sign out and back in so you get a fresh
            token.
          </p>
        </CardContent>
        <CardFooter>
          <SignOutButton redirectUrl="/sign-in">
            <Button className="w-full">Sign out</Button>
          </SignOutButton>
        </CardFooter>
      </Card>
    </main>
  );
}

function Check({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <li className="flex gap-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-delivered" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <div>
        <div>{label}</div>
        {!ok && hint && (
          <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
        )}
      </div>
    </li>
  );
}
