import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="w-full px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="CRUMBS Logo"
              width={32}
              height={32}
              priority
            />
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
