import { UserButton } from "@clerk/nextjs";

// Placeholder until the Phase 2 admin dashboard replaces it.
export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Hotbox Admin
        <UserButton />
      </header>
      <main className="p-8">
        <h1 className="text-4xl font-bold text-center">Hotbox Admin</h1>
        <p className="mt-4 text-center text-slate-500">
          The dashboard is coming soon.
        </p>
      </main>
    </>
  );
}
