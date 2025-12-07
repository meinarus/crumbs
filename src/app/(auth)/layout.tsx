import Link from "next/link";
import { requireNoSession } from "@/lib/auth-helpers";
import { ModeToggle } from "@/components/mode-toggle";
import CrumbsLogo from "@/components/crumbs-logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireNoSession();
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="w-full px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CrumbsLogo className="size-8" />
            <span className="text-foreground text-lg font-bold sm:text-xl">
              CRUMBS
            </span>
          </Link>
          <ModeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
