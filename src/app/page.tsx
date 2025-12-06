import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
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
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.svg"
          alt="CRUMBS Logo"
          width={140}
          height={140}
          className="mb-6"
        />
        <p className="text-muted-foreground mb-6 text-lg font-medium italic">
          Because every bit counts
        </p>
        <h1 className="text-foreground max-w-4xl text-3xl font-bold sm:text-5xl">
          AI-Assisted Costing, Pricing, Recipe & Inventory Management for Food
          Businesses
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg text-lg">
          Manage your inventory, auto-calculate costs, and get AI-suggested
          recipes and pricing — all in one place.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        © {new Date().getFullYear()} CRUMBS. All rights reserved.
      </footer>
    </div>
  );
}
