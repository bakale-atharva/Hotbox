import { SignIn } from "@clerk/nextjs";
import { HotboxLogo } from "@/components/hotbox-logo";

export default function SignInPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-secondary/40 p-6">
      <HotboxLogo className="text-2xl" />
      <SignIn />
    </main>
  );
}
